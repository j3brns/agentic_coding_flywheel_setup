#!/usr/bin/env bash
# DCG Performance Benchmark
# Measures hook latency and enforces sub-millisecond p99 threshold.
# Usage: ./dcg_performance_test.sh [--iterations N] [--target-us N] [--verbose]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/test_harness.sh"

ITERATIONS="${DCG_PERF_ITERATIONS:-200}"
TARGET_P99_US="${DCG_P99_TARGET_US:-1000}"
VERBOSE=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --iterations)
            ITERATIONS="${2:-200}"
            shift 2
            ;;
        --target-us)
            TARGET_P99_US="${2:-1000}"
            shift 2
            ;;
        --verbose)
            VERBOSE="--verbose"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

now_ns() {
    local ts
    ts=$(date +%s%N 2>/dev/null || true)
    if [[ -z "$ts" ]] || [[ "$ts" == *N ]]; then
        echo ""
        return 1
    fi
    echo "$ts"
}

percentile_value() {
    local pct="$1"
    local count="$2"
    local -n values_ref="$3"
    local idx
    idx=$(( (count * pct + 99) / 100 - 1 ))
    if [[ $idx -lt 0 ]]; then
        idx=0
    fi
    echo "${values_ref[$idx]}"
}

main() {
    harness_init "DCG Performance Benchmark"

    harness_section "Prerequisites"
    if ! command -v dcg >/dev/null 2>&1; then
        harness_fail "dcg not found in PATH"
        harness_summary
        exit 1
    fi
    harness_pass "dcg available"

    if [[ -z "$(now_ns)" ]]; then
        harness_skip "High-resolution timer unavailable" "date +%s%N not supported"
        harness_summary
        exit 0
    fi

    harness_section "Benchmark"
    harness_info "Iterations: ${ITERATIONS}"
    harness_info "Target p99: ${TARGET_P99_US}us"

    local hook_input
    hook_input=$(cat <<EOF
{
    "tool_name": "Bash",
    "tool_input": {
        "command": "git status"
    }
}
EOF
)

    local -a durations=()
    local i start_ns end_ns duration_us

    for ((i = 0; i < ITERATIONS; i++)); do
        start_ns="$(now_ns)"
        echo "$hook_input" | dcg >/dev/null 2>&1 || true
        end_ns="$(now_ns)"
        duration_us=$(( (end_ns - start_ns) / 1000 ))
        durations+=("$duration_us")
    done

    mapfile -t sorted < <(printf '%s\n' "${durations[@]}" | sort -n)
    local count="${#sorted[@]}"
    if [[ "$count" -eq 0 ]]; then
        harness_fail "No samples collected"
        harness_summary
        exit 1
    fi

    local sum=0
    for duration_us in "${sorted[@]}"; do
        sum=$((sum + duration_us))
    done
    local avg_us=$((sum / count))
    local p50_us p95_us p99_us
    p50_us="$(percentile_value 50 "$count" sorted)"
    p95_us="$(percentile_value 95 "$count" sorted)"
    p99_us="$(percentile_value 99 "$count" sorted)"

    harness_info "Avg: ${avg_us}us"
    harness_info "p50: ${p50_us}us"
    harness_info "p95: ${p95_us}us"
    harness_info "p99: ${p99_us}us"

    if [[ "$VERBOSE" == "--verbose" ]]; then
        harness_info "Min: ${sorted[0]}us"
        harness_info "Max: ${sorted[$((count - 1))]}us"
    fi

    if [[ "$p99_us" -le "$TARGET_P99_US" ]]; then
        harness_pass "p99 latency within target (${p99_us}us <= ${TARGET_P99_US}us)"
    else
        harness_fail "p99 latency exceeds target (${p99_us}us > ${TARGET_P99_US}us)"
        harness_summary
        exit 1
    fi

    harness_summary
}

main "$@"
