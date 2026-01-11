#!/usr/bin/env bash
# DCG Smoke Test - Quick validation of DCG installation
# Exit codes: 0=pass, 1=fail, 2=skip
# Usage: ./dcg_smoke_test.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }
skip() { echo -e "${YELLOW}[SKIP]${NC} $1 (skipped)"; }

echo "============================================================"
echo "  DCG Smoke Test"
echo "============================================================"
echo ""

# Test 1: Binary exists
echo "1. Checking DCG binary..."
if command -v dcg &>/dev/null; then
    pass "dcg binary found: $(command -v dcg)"
else
    fail "dcg binary not found in PATH"
fi

# Test 2: Version check
echo "2. Checking DCG version..."
if dcg_version=$(dcg --version 2>/dev/null | head -1); then
    pass "dcg version: $dcg_version"
else
    fail "dcg --version failed"
fi

# Test 3: Doctor output (JSON)
echo "3. Checking dcg doctor output..."
doctor_output=$(dcg doctor --format json 2>/dev/null || true)
if [[ -z "$doctor_output" ]]; then
    fail "dcg doctor --format json returned no output"
fi
if command -v jq &>/dev/null; then
    if echo "$doctor_output" | jq -e '.hook_registered' >/dev/null 2>&1; then
        if echo "$doctor_output" | jq -e '.hook_registered == true' >/dev/null 2>&1; then
            pass "Hook is registered (doctor reports hook_registered=true)"
        else
            # Not a fatal error - might be intentional
            skip "Hook not registered (run 'dcg install' to register)"
        fi
    else
        fail "dcg doctor JSON missing hook_registered field: $doctor_output"
    fi
else
    pass "dcg doctor returned JSON (jq not available for validation)"
fi

# Test 4: Packs command
echo "4. Checking dcg packs output..."
packs_output=$(dcg packs 2>/dev/null || true)
if [[ -n "$packs_output" ]]; then
    pass "dcg packs returned pack list"
else
    fail "dcg packs returned empty output"
fi

enabled_output=$(dcg packs --enabled 2>/dev/null || true)
if [[ -n "$enabled_output" ]]; then
    pass "dcg packs --enabled returned enabled packs"
else
    skip "No enabled packs reported (using defaults)"
fi

# Test 5: Test explain output
echo "5. Checking dcg test --explain output..."
explain_output=$(dcg test 'git reset --hard' --explain 2>&1) || true
if echo "$explain_output" | grep -Eqi "why|reason"; then
    pass "dcg test --explain includes reason"
else
    fail "dcg test --explain missing reason. Output: $explain_output"
fi
if echo "$explain_output" | grep -Eqi "safer|alternative|instead|prefer"; then
    pass "dcg test --explain includes safer alternative"
else
    fail "dcg test --explain missing safer alternative. Output: $explain_output"
fi

# Test 6: Install hook command
echo "6. Ensuring dcg install works..."
if dcg install --force >/dev/null 2>&1; then
    pass "dcg install --force completed"
else
    fail "dcg install --force failed"
fi

# Re-check hook status after install
doctor_output=$(dcg doctor --format json 2>/dev/null || true)
if command -v jq &>/dev/null; then
    if echo "$doctor_output" | jq -e '.hook_registered == true' >/dev/null 2>&1; then
        pass "Hook registered after dcg install"
    else
        fail "Hook not registered after dcg install. Output: $doctor_output"
    fi
else
    skip "jq not available to confirm hook registration after install"
fi

# Test 7: Quick block test
echo "7. Testing command blocking..."
block_output=$(dcg test 'git reset --hard' 2>&1) || true
if echo "$block_output" | grep -qi "deny\|block"; then
    pass "Dangerous command correctly identified"
else
    fail "DCG did not identify dangerous command. Output: $block_output"
fi

# Test 8: Quick allow test
echo "8. Testing safe command..."
allow_output=$(dcg test 'git status' 2>&1) || true
if echo "$allow_output" | grep -qi "allow"; then
    pass "Safe command correctly allowed"
else
    fail "DCG incorrectly blocked safe command. Output: $allow_output"
fi

echo ""
echo "============================================================"
echo -e "  ${GREEN}All smoke tests passed!${NC}"
echo "============================================================"
exit 0
