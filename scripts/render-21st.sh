#!/bin/bash
# Render every exported component with 21st's build; print OK/FAIL per slug.
cd "$(dirname "$0")/../.21st"
render() { s=$1; out=$(cd $s && npx -y @21st-dev/cli@1.18.0 render ./$s.tsx --demo ./$s.demo.tsx --out ./preview 2>&1 | tail -3 | tr '\n' ' '); case "$out" in *Rendered:*) echo "OK   $s";; *) echo "FAIL $s: ${out:0:300}";; esac; }
export -f render
printf '%s\n' "$@" | xargs -P 4 -I{} bash -c 'render {}'
