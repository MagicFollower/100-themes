#!/bin/bash

# Applies each theme variant and takes a screenshot of one workspace.
# The screenshots become <theme>/<variant>/preview.png and
# assets/shots/<theme>/<variant>.webp.
#
#   tools/capture.sh                              capture all themes and variants
#   tools/capture.sh synthwave hacker             capture the named themes
#   tools/capture.sh --variant oled,day           capture only these variants
#
# Environment:
#   WORKSPACE  workspace to capture (default 7)
#   DELAY      seconds to wait after each theme change (default 7)
#
# The script restores the original theme and workspace when it stops.
# It removes only the theme links that it added.

set -uo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
THEMES_DIR="$HOME/.config/omarchy/themes"
STATE_DIR="$HOME/.local/state/omarchy/theme-backgrounds"
WORKSPACE=${WORKSPACE:-7}
DELAY=${DELAY:-7}
RAW="$ROOT/.capture"

variants=""
slugs=()
while (( $# > 0 )); do
  case "$1" in
    --variant) variants="$2"; shift 2 ;;
    *) slugs+=("$1"); shift ;;
  esac
done

# One line per capture: <theme> <variant> <installed name>
mapfile -t jobs < <(cd "$ROOT" && VARIANT_LIST="$variants" node -e '
  import("./tools/palettes.mjs").then(({ themes, VARIANTS }) => {
    const only = process.env.VARIANT_LIST ? process.env.VARIANT_LIST.split(",") : VARIANTS.map(v => v.key);
    const names = process.argv.slice(1);
    for (const t of themes) {
      if (names.length && !names.includes(t.slug)) continue;
      for (const { key } of VARIANTS) if (only.includes(key)) console.log(t.slug, key, t.variants[key].install);
    }
  });' "${slugs[@]}")

original_theme=$(cat "$HOME/.local/state/omarchy/current/theme.name")
original_workspace=$(hyprctl activeworkspace -j | jq -r .id)
monitor=$(hyprctl monitors -j | jq -r '.[] | select(.focused) | .name')
created=()

# Hyprland with a Lua config takes Lua dispatchers. Older configs take the plain form.
focus_workspace() {
  hyprctl dispatch "hl.dsp.focus({ workspace = \"$1\" })" >/dev/null 2>&1 || hyprctl dispatch workspace "$1" >/dev/null 2>&1
}

restore() {
  echo "Restoring theme $original_theme and workspace $original_workspace"
  omarchy theme set "$original_theme" >/dev/null 2>&1
  focus_workspace "$original_workspace"
  for name in "${created[@]}"; do
    rm -f "$THEMES_DIR/$name" "$STATE_DIR/$name"
  done
}
trap restore EXIT

focus_workspace "$WORKSPACE"

count=0
for job in "${jobs[@]}"; do
  read -r slug variant install <<<"$job"
  count=$((count + 1))
  src="$ROOT/$slug/$variant"

  # Use a different link name when another theme already has this name.
  name=$install
  if [[ -e $THEMES_DIR/$name && $(readlink -f "$THEMES_DIR/$name") != "$src" ]]; then
    name="$install-capture"
  fi
  if [[ ! -e $THEMES_DIR/$name ]]; then
    ln -s "$src" "$THEMES_DIR/$name"
    created+=("$name")
  fi

  echo "[$count/${#jobs[@]}] $slug $variant"
  omarchy theme set "$name" >/dev/null 2>&1
  focus_workspace "$WORKSPACE"
  sleep "$DELAY"

  # Stop when another workspace is visible, so no other window is captured.
  if [[ $(hyprctl activeworkspace -j | jq -r .id) != "$WORKSPACE" ]]; then
    echo "Workspace $WORKSPACE is not active. Stopping." >&2
    exit 1
  fi
  mkdir -p "$RAW/$slug" "$ROOT/assets/shots/$slug"
  grim -o "$monitor" "$RAW/$slug/$variant.png"

  magick "$RAW/$slug/$variant.png" -resize 1920x -dither FloydSteinberg -colors 256 "PNG8:$src/preview.png"
  magick "$RAW/$slug/$variant.png" -resize 1440x -quality 82 "$ROOT/assets/shots/$slug/$variant.webp"
done
