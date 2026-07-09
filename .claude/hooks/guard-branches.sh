#!/usr/bin/env bash
# guard-branches.sh — hook PreToolUse (Bash) para Claude Code.
# Bloquea `git commit` / `git push` directos a las ramas protegidas main y develop.
# Diseñado para FALLAR-ABIERTO: ante cualquier duda o error, permite el comando
# (la garantía dura es la protección de rama en GitHub; esto es una capa local).

# Lee el evento (JSON) que Claude Code envía por stdin.
input="$(cat 2>/dev/null || true)"

# Solo nos interesan comandos git que hagan commit o push.
if ! printf '%s' "$input" | grep -Eiq 'git[[:space:]].*(commit|push)'; then
  exit 0
fi

# Rama actual del repositorio.
dir="${CLAUDE_PROJECT_DIR:-.}"
branch="$(git -C "$dir" rev-parse --abbrev-ref HEAD 2>/dev/null)"

case "$branch" in
  main|develop)
    printf '%s\n' "BLOQUEADO por politica del repo: no se permite commit/push directo a '$branch'." >&2
    printf '%s\n' "Crea una rama desde 'develop' (feature/FEAT-XXX-... o fix/BUG-XXX-...) y abre un Pull Request." >&2
    printf '%s\n' "Ver CLAUDE.md (Reglas innegociables) y docs/11_flujo_implementacion.md." >&2
    exit 2
    ;;
  *)
    exit 0
    ;;
esac
