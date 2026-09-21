#!/usr/bin/bash

XDG_CONFIG_HOME=${XDG_CONFIG_HOME:-~/.config}

# Allow users to override command-line options
if [[ -f "${XDG_CONFIG_HOME}/clashmetafw-flags.conf" ]]; then
	mapfile -t CLASH_META_FOR_WINDOWS_USER_FLAGS <<<"$(grep -v '^#' "${XDG_CONFIG_HOME}/clashmetafw-flags.conf")"
	echo "User flags:" ${CLASH_META_FOR_WINDOWS_USER_FLAGS[@]}
fi

# Launch
exec electron /opt/clashmetafw ${CLASH_META_FOR_WINDOWS_USER_FLAGS[@]} "$@"
