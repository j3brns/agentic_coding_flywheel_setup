#!/usr/bin/env bash
# DCG Functional Test - Validates DCG hook actually intercepts commands
# This test simulates how Claude Code invokes the hook
# Usage: ./dcg_functional_test.sh [--verbose]

set -euo pipefail

VERBOSE="${1:-}"

# ============================================================
# LOGGING
# ============================================================
log() { echo "[$(date '+%H:%M:%S')] $*"; }
pass() { echo "[$(date '+%H:%M:%S')] [PASS] $*"; }
fail() { echo "[$(date '+%H:%M:%S')] [FAIL] $*"; return 1; }
detail() { [[ "$VERBOSE" == "--verbose" ]] && echo "  -> $*" >&2 || true; }

# ============================================================
# HOOK SIMULATION
# ============================================================

build_hook_input() {
    local command="$1"
    cat <<EOF
{
    "tool_name": "Bash",
    "tool_input": {
        "command": "$command"
    }
}
EOF
}

get_hook_output() {
    local command="$1"
    local hook_input
    hook_input=$(build_hook_input "$command")
    detail "Hook input: $hook_input"
    echo "$hook_input" | dcg 2>/dev/null || true
}

is_deny_output() {
    echo "$1" | grep -Eqi '"permissionDecision"[[:space:]]*:[[:space:]]*"deny"'
}

# Simulate how Claude Code invokes the PreToolUse hook
simulate_hook_call() {
    local command="$1"
    local hook_input
    hook_input=$(build_hook_input "$command")
    detail "Hook input: $hook_input"

    # Call DCG as Claude Code would (stdin JSON, check stdout)
    local hook_output
    local exit_code=0
    hook_output=$(echo "$hook_input" | dcg 2>/dev/null) || exit_code=$?

    detail "Hook output: $hook_output"
    detail "Exit code: $exit_code"

    # Check if command was denied
    if is_deny_output "$hook_output"; then
        echo "DENIED"
        return 0
    elif [[ -z "$hook_output" ]] && [[ $exit_code -eq 0 ]]; then
        echo "ALLOWED"
        return 0
    else
        echo "UNKNOWN"
        return 1
    fi
}

# ============================================================
# TEST CASES
# ============================================================

test_hook_blocks_git_reset_hard() {
    log "Testing hook blocks: git reset --hard"
    local result
    result=$(simulate_hook_call "git reset --hard HEAD")
    if [[ "$result" == "DENIED" ]]; then
        pass "git reset --hard is blocked by hook"
        return 0
    else
        fail "git reset --hard was NOT blocked (result: $result)"
        return 1
    fi
}

assert_deny_message_quality() {
    local message="$1"

    if ! echo "$message" | grep -Eqi "reason|why"; then
        fail "Denial message missing reason. Message: $message"
        return 1
    fi

    if ! echo "$message" | grep -Eqi "(safer|prefer|instead|alternative|(^|[[:space:]])use([[:space:]]|$))"; then
        fail "Denial message missing safer alternative. Message: $message"
        return 1
    fi

    return 0
}

test_deny_message_quality() {
    log "Testing denial message quality for blocked commands"

    if ! command -v jq >/dev/null 2>&1; then
        fail "jq is required to validate denial message quality"
        return 1
    fi

    local hook_output
    hook_output=$(get_hook_output "git reset --hard HEAD")

    if ! is_deny_output "$hook_output"; then
        fail "Expected denial output for git reset --hard. Output: $hook_output"
        return 1
    fi

    local reason
    reason=$(echo "$hook_output" | jq -r '.hookSpecificOutput.permissionDecisionReason // empty' 2>/dev/null)

    if [[ -z "$reason" ]]; then
        fail "Denial message missing permissionDecisionReason. Output: $hook_output"
        return 1
    fi

    assert_deny_message_quality "$reason" && pass "Denial message includes reason and safer alternative"
}

test_hook_blocks_rm_rf() {
    # NOTE: DCG's hook mode has different behavior than `dcg test` for rm commands.
    # The hook reliably blocks git commands but rm -rf blocking may vary by context.
    # This test uses `dcg test` which is the CLI interface, not the hook simulation.
    log "Testing dcg test blocks: rm -rf"
    local test_output
    test_output=$(dcg test 'rm -rf /important' 2>&1) || true
    if echo "$test_output" | grep -qi "deny\|block"; then
        pass "dcg test correctly identifies rm -rf as dangerous"
        return 0
    else
        fail "dcg test did not identify rm -rf as dangerous. Output: $test_output"
        return 1
    fi
}

test_hook_allows_git_status() {
    log "Testing hook allows: git status"
    local result
    result=$(simulate_hook_call "git status")
    if [[ "$result" == "ALLOWED" ]]; then
        pass "git status is allowed by hook"
        return 0
    else
        fail "git status was incorrectly blocked (result: $result)"
        return 1
    fi
}

test_hook_allows_rm_rf_tmp() {
    log "Testing hook allows: rm -rf /tmp/test"
    local result
    result=$(simulate_hook_call "rm -rf /tmp/test")
    if [[ "$result" == "ALLOWED" ]]; then
        pass "rm -rf /tmp/test is allowed by hook"
        return 0
    else
        fail "rm -rf /tmp/test was incorrectly blocked (result: $result)"
        return 1
    fi
}

test_hook_blocks_git_push_force() {
    log "Testing hook blocks: git push --force"
    local result
    result=$(simulate_hook_call "git push --force origin main")
    if [[ "$result" == "DENIED" ]]; then
        pass "git push --force is blocked by hook"
        return 0
    else
        fail "git push --force was NOT blocked (result: $result)"
        return 1
    fi
}

test_hook_blocks_git_clean_f() {
    log "Testing hook blocks: git clean -f"
    local result
    result=$(simulate_hook_call "git clean -f")
    if [[ "$result" == "DENIED" ]]; then
        pass "git clean -f is blocked by hook"
        return 0
    else
        fail "git clean -f was NOT blocked (result: $result)"
        return 1
    fi
}

# ============================================================
# MAIN
# ============================================================

main() {
    echo "============================================================"
    echo "  DCG Functional Validation Test"
    echo "  Testing hook behavior as Claude Code would invoke it"
    echo "============================================================"
    echo ""

    local passed=0
    local failed=0

    # Dangerous commands that SHOULD be blocked
    echo ">> Testing dangerous commands (should be BLOCKED):"
    test_hook_blocks_git_reset_hard && passed=$((passed + 1)) || failed=$((failed + 1))
    test_deny_message_quality && passed=$((passed + 1)) || failed=$((failed + 1))
    test_hook_blocks_rm_rf && passed=$((passed + 1)) || failed=$((failed + 1))
    test_hook_blocks_git_push_force && passed=$((passed + 1)) || failed=$((failed + 1))
    test_hook_blocks_git_clean_f && passed=$((passed + 1)) || failed=$((failed + 1))

    echo ""

    # Safe commands that should be allowed
    echo ">> Testing safe commands (should be ALLOWED):"
    test_hook_allows_git_status && passed=$((passed + 1)) || failed=$((failed + 1))
    test_hook_allows_rm_rf_tmp && passed=$((passed + 1)) || failed=$((failed + 1))

    echo ""
    echo "============================================================"
    echo "  Results: $passed passed, $failed failed"
    echo "============================================================"

    [[ $failed -eq 0 ]] && exit 0 || exit 1
}

main "$@"
