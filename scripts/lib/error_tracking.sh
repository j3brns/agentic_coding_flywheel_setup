#!/usr/bin/env bash
# ============================================================
# ACFS Error Tracking Library
#
# Provides error context tracking and step execution wrappers
# to capture exactly where failures occur during installation.
#
# Related beads:
#   - agentic_coding_flywheel_setup-qqo: Create error context tracking
#   - agentic_coding_flywheel_setup-fkf: EPIC: Per-Phase Error Reporting
# ============================================================

# Prevent multiple sourcing
if [[ -n "${_ACFS_ERROR_TRACKING_SH_LOADED:-}" ]]; then
    return 0
fi
_ACFS_ERROR_TRACKING_SH_LOADED=1

# ============================================================
# Global Error Context Variables
# ============================================================
# These are updated as installation progresses to provide
# context when errors occur.

# Current phase being executed (e.g., "shell_setup", "cli_tools")
CURRENT_PHASE="${CURRENT_PHASE:-}"

# Human-readable name of current phase (e.g., "Shell Setup")
CURRENT_PHASE_NAME="${CURRENT_PHASE_NAME:-}"

# Current step within the phase (e.g., "Installing ripgrep")
CURRENT_STEP="${CURRENT_STEP:-}"

# Last error message captured
LAST_ERROR="${LAST_ERROR:-}"

# Exit code from last failed command
LAST_ERROR_CODE="${LAST_ERROR_CODE:-0}"

# Output captured from last failed command (truncated)
LAST_ERROR_OUTPUT="${LAST_ERROR_OUTPUT:-}"

# Timestamp when error occurred
LAST_ERROR_TIME="${LAST_ERROR_TIME:-}"

# Maximum length of error output to store (prevents huge logs)
ERROR_OUTPUT_MAX_LENGTH="${ERROR_OUTPUT_MAX_LENGTH:-2000}"

# Enable/disable verbose error output
ERROR_VERBOSE="${ERROR_VERBOSE:-false}"

# ============================================================
# Phase Management
# ============================================================

# Set the current phase context
# Usage: set_phase <phase_id> [phase_name]
# Example: set_phase "cli_tools" "CLI Tools"
set_phase() {
    local phase_id="$1"
    local phase_name="${2:-$phase_id}"

    CURRENT_PHASE="$phase_id"
    CURRENT_PHASE_NAME="$phase_name"
    CURRENT_STEP=""
    LAST_ERROR=""
    LAST_ERROR_CODE=0
    LAST_ERROR_OUTPUT=""

    # Update state file if state functions are available
    if type -t state_phase_start &>/dev/null; then
        state_phase_start "$phase_id"
    fi
}

# Clear phase context (call at phase completion)
# Usage: clear_phase
clear_phase() {
    local completed_phase="$CURRENT_PHASE"
    CURRENT_PHASE=""
    CURRENT_PHASE_NAME=""
    CURRENT_STEP=""

    # Update state file if state functions are available
    if [[ -n "$completed_phase" ]] && type -t state_phase_complete &>/dev/null; then
        state_phase_complete "$completed_phase"
    fi
}

# ============================================================
# Step Execution with Error Capture
# ============================================================

# Execute a command with error tracking
# Usage: try_step "description" command [args...]
# Returns: Command exit code
#
# On success: Returns 0, clears error state
# On failure: Returns exit code, sets LAST_ERROR_*, updates state
#
# Example:
#   try_step "Installing ripgrep" sudo apt-get install -y ripgrep
#   try_step "Building project" make -j4
#
try_step() {
    local description="$1"
    shift

    # Update step context
    CURRENT_STEP="$description"

    # Update state file if available
    if type -t state_step_update &>/dev/null; then
        state_step_update "$description"
    fi

    # Log step start if logging available
    if type -t log_detail &>/dev/null; then
        log_detail "$description..."
    fi

    # Create temp file for output capture
    local output_file
    output_file=$(mktemp) || output_file="/tmp/acfs_step_output.$$"

    local exit_code=0

    # Execute command with output capture
    # We use process substitution to capture both stdout and stderr
    if [[ "$ERROR_VERBOSE" == "true" ]]; then
        # Verbose mode: show output in real-time AND capture it
        "$@" 2>&1 | tee "$output_file"
        exit_code=${PIPESTATUS[0]}
    else
        # Normal mode: capture silently, show on error
        "$@" > "$output_file" 2>&1
        exit_code=$?
    fi

    if [[ $exit_code -eq 0 ]]; then
        # Success - clear error state
        LAST_ERROR=""
        LAST_ERROR_CODE=0
        LAST_ERROR_OUTPUT=""
        rm -f "$output_file" 2>/dev/null
        return 0
    fi

    # Failure - capture error context
    LAST_ERROR="$description failed with exit code $exit_code"
    LAST_ERROR_CODE=$exit_code
    LAST_ERROR_TIME=$(date -Iseconds)

    # Capture and truncate output
    if [[ -f "$output_file" ]]; then
        local full_output
        full_output=$(cat "$output_file" 2>/dev/null || echo "")

        # Truncate if too long
        if [[ ${#full_output} -gt $ERROR_OUTPUT_MAX_LENGTH ]]; then
            LAST_ERROR_OUTPUT="${full_output:0:$ERROR_OUTPUT_MAX_LENGTH}... [truncated]"
        else
            LAST_ERROR_OUTPUT="$full_output"
        fi
    fi

    rm -f "$output_file" 2>/dev/null

    # Update state file with failure info
    if type -t state_phase_fail &>/dev/null; then
        state_phase_fail "$CURRENT_PHASE" "$description" "$LAST_ERROR"
    fi

    # Log error if logging available
    if type -t log_error &>/dev/null; then
        log_error "$description failed (exit $exit_code)"
    fi

    return $exit_code
}

# Execute a command that can fail without aborting
# Usage: try_step_optional "description" command [args...]
# Returns: Command exit code (but doesn't update error state on failure)
#
# Use for non-critical steps that shouldn't stop installation
try_step_optional() {
    local description="$1"
    shift

    CURRENT_STEP="$description"

    if type -t log_detail &>/dev/null; then
        log_detail "$description (optional)..."
    fi

    local exit_code=0
    "$@" >/dev/null 2>&1 || exit_code=$?

    if [[ $exit_code -ne 0 ]]; then
        if type -t log_warn &>/dev/null; then
            log_warn "$description failed (non-critical)"
        fi
    fi

    return $exit_code
}

# Execute a command with retry on failure
# Usage: try_step_retry <max_attempts> <delay_seconds> "description" command [args...]
# Returns: 0 on eventual success, last exit code on failure
#
# Example:
#   try_step_retry 3 5 "Downloading package" curl -fsSL https://example.com/file
#
try_step_retry() {
    local max_attempts="$1"
    local delay="$2"
    local description="$3"
    shift 3

    local attempt=1
    local exit_code=0

    while [[ $attempt -le $max_attempts ]]; do
        CURRENT_STEP="$description (attempt $attempt/$max_attempts)"

        if type -t state_step_update &>/dev/null; then
            state_step_update "$CURRENT_STEP"
        fi

        if [[ $attempt -gt 1 ]] && type -t log_detail &>/dev/null; then
            log_detail "Retrying $description (attempt $attempt/$max_attempts)..."
        fi

        # Execute command
        exit_code=0
        "$@" >/dev/null 2>&1 || exit_code=$?

        if [[ $exit_code -eq 0 ]]; then
            return 0
        fi

        # Don't sleep after last attempt
        if [[ $attempt -lt $max_attempts ]]; then
            sleep "$delay"
        fi

        ((attempt++))
    done

    # All attempts failed
    LAST_ERROR="$description failed after $max_attempts attempts"
    LAST_ERROR_CODE=$exit_code
    LAST_ERROR_TIME=$(date -Iseconds)

    if type -t state_phase_fail &>/dev/null; then
        state_phase_fail "$CURRENT_PHASE" "$description" "$LAST_ERROR"
    fi

    if type -t log_error &>/dev/null; then
        log_error "$description failed after $max_attempts attempts (exit $exit_code)"
    fi

    return $exit_code
}

# ============================================================
# Error Reporting
# ============================================================

# Get current error context as a formatted string
# Usage: get_error_context
# Outputs: Multi-line error context report
get_error_context() {
    if [[ -z "$LAST_ERROR" ]]; then
        echo "No error recorded"
        return 0
    fi

    echo "=== Error Context ==="
    echo "Phase: ${CURRENT_PHASE:-unknown} (${CURRENT_PHASE_NAME:-unknown})"
    echo "Step: ${CURRENT_STEP:-unknown}"
    echo "Error: $LAST_ERROR"
    echo "Exit Code: $LAST_ERROR_CODE"
    echo "Time: ${LAST_ERROR_TIME:-unknown}"

    if [[ -n "$LAST_ERROR_OUTPUT" ]]; then
        echo ""
        echo "=== Output ==="
        echo "$LAST_ERROR_OUTPUT"
    fi
}

# Get error context as JSON
# Usage: get_error_context_json
# Outputs: JSON object with error context
get_error_context_json() {
    if ! command -v jq &>/dev/null; then
        # Fallback without jq - basic JSON escaping
        local escaped_error="${LAST_ERROR//\"/\\\"}"
        local escaped_output="${LAST_ERROR_OUTPUT//\"/\\\"}"
        escaped_output="${escaped_output//$'\n'/\\n}"

        cat <<EOF
{
  "phase": "${CURRENT_PHASE:-null}",
  "phase_name": "${CURRENT_PHASE_NAME:-null}",
  "step": "${CURRENT_STEP:-null}",
  "error": "${escaped_error:-null}",
  "exit_code": ${LAST_ERROR_CODE:-0},
  "time": "${LAST_ERROR_TIME:-null}",
  "output": "${escaped_output:-null}"
}
EOF
        return
    fi

    # Use jq for proper JSON encoding
    jq -n \
        --arg phase "${CURRENT_PHASE:-}" \
        --arg phase_name "${CURRENT_PHASE_NAME:-}" \
        --arg step "${CURRENT_STEP:-}" \
        --arg error "${LAST_ERROR:-}" \
        --argjson exit_code "${LAST_ERROR_CODE:-0}" \
        --arg time "${LAST_ERROR_TIME:-}" \
        --arg output "${LAST_ERROR_OUTPUT:-}" \
        '{
            phase: (if $phase == "" then null else $phase end),
            phase_name: (if $phase_name == "" then null else $phase_name end),
            step: (if $step == "" then null else $step end),
            error: (if $error == "" then null else $error end),
            exit_code: $exit_code,
            time: (if $time == "" then null else $time end),
            output: (if $output == "" then null else $output end)
        }'
}

# Check if there's an active error
# Usage: has_error && handle_error
# Returns: 0 if error exists, 1 if no error
has_error() {
    [[ -n "$LAST_ERROR" ]] && [[ "$LAST_ERROR_CODE" -ne 0 ]]
}

# Clear error state (use after handling an error)
# Usage: clear_error
clear_error() {
    LAST_ERROR=""
    LAST_ERROR_CODE=0
    LAST_ERROR_OUTPUT=""
    LAST_ERROR_TIME=""
}

# ============================================================
# Convenience Wrappers
# ============================================================

# Run a phase with automatic context management
# Usage: run_phase <phase_id> <phase_name> <function_to_run> [args...]
# Returns: Function exit code
#
# Example:
#   run_phase "cli_tools" "CLI Tools" install_cli_tools
#
run_phase() {
    local phase_id="$1"
    local phase_name="$2"
    local func="$3"
    shift 3

    set_phase "$phase_id" "$phase_name"

    local exit_code=0
    if ! "$func" "$@"; then
        exit_code=$?
        # Error state already set by try_step calls within the function
        return $exit_code
    fi

    clear_phase
    return 0
}

# Check if a phase should be skipped (already completed or explicitly skipped)
# Usage: should_skip_phase <phase_id> && return 0
# Returns: 0 if should skip, 1 if should run
should_skip_phase() {
    local phase_id="$1"

    # Check state file if available
    if type -t state_should_skip_phase &>/dev/null; then
        state_should_skip_phase "$phase_id"
        return $?
    fi

    return 1  # Default: don't skip
}
