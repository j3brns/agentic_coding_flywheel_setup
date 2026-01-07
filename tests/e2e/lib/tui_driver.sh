#!/usr/bin/env bash
# ============================================================
# TUI Driver - Automation driver for terminal UI testing
#
# Supports two modes:
# 1. Expect mode: Full PTY-based automation (requires expect)
# 2. Pipe mode: Stdin piping for simpler automation
#
# Usage:
#   source tui_driver.sh
#   tui_driver_init
#   tui_run_with_input "command" "args" <<< "input"
#   tui_expect_run "script.exp" "args"
#   tui_driver_cleanup
# ============================================================

# Driver state
TUI_DRIVER_MODE=""
TUI_DRIVER_LOG=""
TUI_SCREEN_CAPTURE=""
TUI_LAST_OUTPUT=""
TUI_LAST_EXIT_CODE=0
TUI_EXPECT_DIR=""

# Key codes for convenience
KEY_ENTER=$'\n'
KEY_TAB=$'\t'
KEY_ESC=$'\e'
KEY_UP=$'\e[A'
KEY_DOWN=$'\e[B'
KEY_LEFT=$'\e[D'
KEY_RIGHT=$'\e[C'
KEY_SPACE=' '
KEY_BACKSPACE=$'\x7f'

# ============================================================
# Initialization
# ============================================================

tui_driver_init() {
    # Determine mode based on available tools
    if command -v expect &>/dev/null; then
        TUI_DRIVER_MODE="expect"
    else
        TUI_DRIVER_MODE="pipe"
    fi

    # Set up logging
    local log_base="${E2E_LOGS_DIR:-/tmp}"
    TUI_DRIVER_LOG="$log_base/tui_driver_$(date +%Y%m%d_%H%M%S).log"
    TUI_SCREEN_CAPTURE="$log_base/tui_screen_$(date +%Y%m%d_%H%M%S).txt"

    # Find expect scripts directory
    TUI_EXPECT_DIR="${E2E_DIR:-$(dirname "${BASH_SOURCE[0]}")/..}/expect"

    tui_log "INFO" "TUI driver initialized in $TUI_DRIVER_MODE mode"
    tui_log "DEBUG" "Log file: $TUI_DRIVER_LOG"
    tui_log "DEBUG" "Expect dir: $TUI_EXPECT_DIR"
}

tui_driver_cleanup() {
    tui_log "INFO" "TUI driver cleanup"
    # Keep logs for debugging - they'll be cleaned up by test teardown
}

# ============================================================
# Logging
# ============================================================

tui_log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp
    timestamp=$(date '+%H:%M:%S.%3N')

    echo "[$timestamp] [$level] $message" >> "${TUI_DRIVER_LOG:-/dev/null}"
}

# ============================================================
# Input Helpers
# ============================================================

# Generate input sequence for typing text followed by Enter
tui_type() {
    local text="$1"
    echo -n "${text}${KEY_ENTER}"
}

# Generate input for pressing Enter
tui_enter() {
    echo -n "${KEY_ENTER}"
}

# Generate input for Escape
tui_escape() {
    echo -n "${KEY_ESC}"
}

# Generate input for arrow keys
tui_arrow_up() { echo -n "${KEY_UP}"; }
tui_arrow_down() { echo -n "${KEY_DOWN}"; }
tui_arrow_left() { echo -n "${KEY_LEFT}"; }
tui_arrow_right() { echo -n "${KEY_RIGHT}"; }

# Generate input for Space (toggle)
tui_space() {
    echo -n "${KEY_SPACE}"
}

# Generate input for Tab
tui_tab() {
    echo -n "${KEY_TAB}"
}

# Build an input sequence
# Usage: tui_sequence "enter" "type:hello" "enter" "q"
tui_sequence() {
    local seq=""
    for action in "$@"; do
        case "$action" in
            enter)
                seq+="${KEY_ENTER}"
                ;;
            escape|esc)
                seq+="${KEY_ESC}"
                ;;
            space)
                seq+="${KEY_SPACE}"
                ;;
            tab)
                seq+="${KEY_TAB}"
                ;;
            up)
                seq+="${KEY_UP}"
                ;;
            down)
                seq+="${KEY_DOWN}"
                ;;
            left)
                seq+="${KEY_LEFT}"
                ;;
            right)
                seq+="${KEY_RIGHT}"
                ;;
            type:*)
                seq+="${action#type:}"
                ;;
            key:*)
                seq+="${action#key:}"
                ;;
            wait:*)
                # For expect mode - encode delay
                seq+="__WAIT_${action#wait:}__"
                ;;
            *)
                # Literal character
                seq+="$action"
                ;;
        esac
    done
    echo -n "$seq"
}

# ============================================================
# Pipe Mode Execution
# ============================================================

# Run command with piped input
# Usage: tui_run_with_input "command" "args..." <<< "input"
tui_run_with_input() {
    local cmd="$1"
    shift
    local args=("$@")

    tui_log "INFO" "Running: $cmd ${args[*]}"

    # Read input from stdin
    local input
    input=$(cat)

    tui_log "DEBUG" "Input sequence: $(echo "$input" | cat -v)"

    # Set up environment for TUI
    local output_file
    output_file=$(mktemp)

    # Run with timeout to prevent hangs
    local timeout_cmd=""
    if command -v timeout &>/dev/null; then
        timeout_cmd="timeout 30"
    fi

    # Execute with input piping
    # Use script to allocate a PTY if available
    if command -v script &>/dev/null && [[ -c /dev/ptmx ]]; then
        tui_log "DEBUG" "Using script for PTY allocation"
        TUI_LAST_EXIT_CODE=0
        # Write input to temp file to avoid quoting issues
        local input_file
        input_file=$(mktemp)
        printf '%s' "$input" > "$input_file"
        # Use script -q to allocate PTY
        $timeout_cmd script -q -c "cat '$input_file' | '$cmd' $(printf '%q ' "${args[@]}")" "$output_file" 2>&1 || TUI_LAST_EXIT_CODE=$?
        rm -f "$input_file"
    else
        tui_log "DEBUG" "Using direct stdin piping"
        TUI_LAST_EXIT_CODE=0
        echo "$input" | $timeout_cmd "$cmd" "${args[@]}" > "$output_file" 2>&1 || TUI_LAST_EXIT_CODE=$?
    fi

    TUI_LAST_OUTPUT=$(cat "$output_file")

    # Save to screen capture
    echo "$TUI_LAST_OUTPUT" >> "$TUI_SCREEN_CAPTURE"

    tui_log "DEBUG" "Exit code: $TUI_LAST_EXIT_CODE"
    tui_log "DEBUG" "Output length: ${#TUI_LAST_OUTPUT} chars"

    rm -f "$output_file"

    return $TUI_LAST_EXIT_CODE
}

# ============================================================
# Expect Mode Execution
# ============================================================

# Run an expect script
# Usage: tui_expect_run "script_name.exp" "arg1" "arg2"
tui_expect_run() {
    local script_name="$1"
    shift
    local args=("$@")

    if [[ "$TUI_DRIVER_MODE" != "expect" ]]; then
        tui_log "ERROR" "Expect mode not available"
        return 1
    fi

    local script_path="$TUI_EXPECT_DIR/$script_name"
    if [[ ! -f "$script_path" ]]; then
        tui_log "ERROR" "Expect script not found: $script_path"
        return 1
    fi

    tui_log "INFO" "Running expect script: $script_name"

    local output_file
    output_file=$(mktemp)

    TUI_LAST_EXIT_CODE=0
    expect "$script_path" "${args[@]}" > "$output_file" 2>&1 || TUI_LAST_EXIT_CODE=$?

    TUI_LAST_OUTPUT=$(cat "$output_file")
    echo "$TUI_LAST_OUTPUT" >> "$TUI_SCREEN_CAPTURE"

    tui_log "DEBUG" "Expect exit code: $TUI_LAST_EXIT_CODE"

    rm -f "$output_file"

    return $TUI_LAST_EXIT_CODE
}

# Generate expect script dynamically
# Usage: tui_generate_expect "command" "timeout" <<< "action_sequence"
tui_generate_expect() {
    local command="$1"
    local timeout="${2:-30}"

    local script
    script=$(mktemp --suffix=.exp)

    cat > "$script" << 'EXPECT_HEADER'
#!/usr/bin/expect -f
# Auto-generated expect script for TUI testing

set timeout TIMEOUT_VALUE
log_user 1

# Start the command
spawn COMMAND_VALUE

# Wait for initial screen
expect {
    timeout { puts "Timeout waiting for initial screen"; exit 1 }
    -re ".*"
}

EXPECT_HEADER

    # Replace placeholders
    sed -i "s|TIMEOUT_VALUE|$timeout|g" "$script"
    sed -i "s|COMMAND_VALUE|$command|g" "$script"

    # Read action sequence and generate expect commands
    while IFS= read -r action; do
        case "$action" in
            enter)
                echo 'send "\r"' >> "$script"
                echo 'expect -re ".*"' >> "$script"
                ;;
            escape)
                echo 'send "\033"' >> "$script"
                echo 'expect -re ".*"' >> "$script"
                ;;
            space)
                echo 'send " "' >> "$script"
                echo 'expect -re ".*"' >> "$script"
                ;;
            type:*)
                local text="${action#type:}"
                echo "send \"$text\"" >> "$script"
                ;;
            wait:*)
                local delay="${action#wait:}"
                echo "sleep $delay" >> "$script"
                ;;
            expect:*)
                local pattern="${action#expect:}"
                echo "expect \"$pattern\"" >> "$script"
                ;;
            *)
                echo "send \"$action\"" >> "$script"
                ;;
        esac
    done

    # Add closing
    cat >> "$script" << 'EXPECT_FOOTER'

# Wait for completion
expect eof
catch wait result
exit [lindex $result 3]
EXPECT_FOOTER

    echo "$script"
}

# ============================================================
# High-Level Test Actions
# ============================================================

# Navigate through wizard to a specific screen
tui_navigate_to_screen() {
    local target_screen="$1"
    local project_name="${2:-test-project}"
    local project_dir="${3:-/tmp/$project_name}"

    local sequence=""

    case "$target_screen" in
        welcome)
            # Already at welcome
            sequence=""
            ;;
        project_name)
            # From welcome: Enter
            sequence="${KEY_ENTER}"
            ;;
        directory)
            # From welcome: Enter, type name, Enter
            sequence="${KEY_ENTER}${project_name}${KEY_ENTER}"
            ;;
        tech_stack)
            # Through directory
            sequence="${KEY_ENTER}${project_name}${KEY_ENTER}${project_dir}${KEY_ENTER}"
            ;;
        features)
            # Through tech_stack (press Enter to skip)
            sequence="${KEY_ENTER}${project_name}${KEY_ENTER}${project_dir}${KEY_ENTER}${KEY_ENTER}"
            ;;
        agents_preview)
            # Through features
            sequence="${KEY_ENTER}${project_name}${KEY_ENTER}${project_dir}${KEY_ENTER}${KEY_ENTER}${KEY_ENTER}"
            ;;
        confirmation)
            # Through agents_preview
            sequence="${KEY_ENTER}${project_name}${KEY_ENTER}${project_dir}${KEY_ENTER}${KEY_ENTER}${KEY_ENTER}${KEY_ENTER}"
            ;;
        *)
            tui_log "ERROR" "Unknown screen: $target_screen"
            return 1
            ;;
    esac

    echo -n "$sequence"
}

# Complete wizard run with all defaults
tui_complete_wizard() {
    local project_name="${1:-test-project}"
    local project_dir="${2:-/tmp/$project_name}"

    # Full sequence: welcome -> name -> dir -> tech -> features -> agents -> confirm -> success
    local sequence=""

    # Welcome: Enter
    sequence+="${KEY_ENTER}"

    # Project name: type name, Enter
    sequence+="${project_name}${KEY_ENTER}"

    # Directory: type dir, Enter
    sequence+="${project_dir}${KEY_ENTER}"

    # Tech stack: Enter (skip)
    sequence+="${KEY_ENTER}"

    # Features: Enter (accept defaults)
    sequence+="${KEY_ENTER}"

    # Agents preview: Enter (continue)
    sequence+="${KEY_ENTER}"

    # Confirmation: c (create)
    sequence+="c"

    # Success: q (quit)
    sequence+="q"

    echo -n "$sequence"
}

# ============================================================
# Assertions
# ============================================================

# Assert last output contains string
tui_assert_output_contains() {
    local expected="$1"

    if [[ "$TUI_LAST_OUTPUT" == *"$expected"* ]]; then
        tui_log "PASS" "Output contains: $expected"
        return 0
    else
        tui_log "FAIL" "Output does not contain: $expected"
        tui_log "DEBUG" "Actual output: $TUI_LAST_OUTPUT"
        return 1
    fi
}

# Assert last exit code
tui_assert_exit_code() {
    local expected="$1"

    if [[ "$TUI_LAST_EXIT_CODE" -eq "$expected" ]]; then
        tui_log "PASS" "Exit code is $expected"
        return 0
    else
        tui_log "FAIL" "Expected exit code $expected, got $TUI_LAST_EXIT_CODE"
        return 1
    fi
}

# Assert wizard succeeded
tui_assert_success() {
    tui_assert_exit_code 0 && tui_assert_output_contains "Project Created"
}

# Assert wizard showed error
tui_assert_error() {
    local error_msg="$1"
    tui_assert_output_contains "$error_msg"
}

# ============================================================
# Export key codes and functions
# ============================================================

export KEY_ENTER KEY_TAB KEY_ESC KEY_UP KEY_DOWN KEY_LEFT KEY_RIGHT KEY_SPACE KEY_BACKSPACE
export TUI_DRIVER_MODE TUI_DRIVER_LOG TUI_SCREEN_CAPTURE TUI_LAST_OUTPUT TUI_LAST_EXIT_CODE
export -f tui_driver_init tui_driver_cleanup tui_log
export -f tui_type tui_enter tui_escape tui_space tui_tab
export -f tui_arrow_up tui_arrow_down tui_arrow_left tui_arrow_right
export -f tui_sequence tui_run_with_input tui_expect_run
export -f tui_navigate_to_screen tui_complete_wizard
export -f tui_assert_output_contains tui_assert_exit_code tui_assert_success tui_assert_error
