#!/usr/bin/env bash
# shellcheck disable=SC1091
# ============================================================
# ACFS Installer - Install Helpers
# Shared helpers for module execution and selection.
# ============================================================

# NOTE: Do not enable strict mode here. This file is sourced by
# installers and generated scripts and must not leak set -euo pipefail.

INSTALL_HELPERS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ensure logging functions are available (best effort)
if [[ -z "${ACFS_BLUE:-}" ]]; then
    # shellcheck source=logging.sh
    source "$INSTALL_HELPERS_DIR/logging.sh" 2>/dev/null || true
fi

# ------------------------------------------------------------
# Selection state (populated by parse_args or manifest selection)
# ------------------------------------------------------------
if [[ "${ONLY_MODULES+x}" != "x" ]]; then
    ONLY_MODULES=()
fi
if [[ "${ONLY_PHASES+x}" != "x" ]]; then
    ONLY_PHASES=()
fi
if [[ "${SKIP_MODULES+x}" != "x" ]]; then
    SKIP_MODULES=()
fi
: "${NO_DEPS:=false}"
: "${PRINT_PLAN:=false}"

# ------------------------------------------------------------
# Command execution helpers (heredoc-friendly)
# ------------------------------------------------------------

_run_shell_with_strict_mode() {
    local cmd="$1"

    if [[ -n "$cmd" ]]; then
        bash -lc "set -euo pipefail; $cmd"
        return $?
    fi

    # stdin mode (supports heredocs/pipes)
    bash -lc 'set -euo pipefail; (printf "%s\n" "set -euo pipefail"; cat) | bash -s'
}

# Run a shell string (or stdin) as TARGET_USER
run_as_target_shell() {
    local cmd="${1:-}"

    if ! declare -f run_as_target >/dev/null 2>&1; then
        log_error "run_as_target_shell requires run_as_target"
        return 1
    fi

    if [[ -n "$cmd" ]]; then
        run_as_target bash -lc "set -euo pipefail; $cmd"
        return $?
    fi

    # stdin mode
    run_as_target bash -lc 'set -euo pipefail; (printf "%s\n" "set -euo pipefail"; cat) | bash -s'
}

# Run a shell string (or stdin) as root
run_as_root_shell() {
    local cmd="${1:-}"

    if [[ "$EUID" -eq 0 ]]; then
        _run_shell_with_strict_mode "$cmd"
        return $?
    fi

    if [[ -n "${SUDO:-}" ]]; then
        if [[ -n "$cmd" ]]; then
            $SUDO bash -lc "set -euo pipefail; $cmd"
            return $?
        fi
        $SUDO bash -lc 'set -euo pipefail; (printf "%s\n" "set -euo pipefail"; cat) | bash -s'
        return $?
    fi

    if command -v sudo >/dev/null 2>&1; then
        if [[ -n "$cmd" ]]; then
            sudo bash -lc "set -euo pipefail; $cmd"
            return $?
        fi
        sudo bash -lc 'set -euo pipefail; (printf "%s\n" "set -euo pipefail"; cat) | bash -s'
        return $?
    fi

    log_error "run_as_root_shell requires root or sudo"
    return 1
}

# Run a shell string (or stdin) as current user
run_as_current_shell() {
    local cmd="${1:-}"
    _run_shell_with_strict_mode "$cmd"
}

# ------------------------------------------------------------
# Command existence helpers
# ------------------------------------------------------------

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

command_exists_as_target() {
    local cmd="$1"
    if ! declare -f run_as_target >/dev/null 2>&1; then
        return 1
    fi

    run_as_target bash -lc "command -v '$cmd' >/dev/null 2>&1"
}
