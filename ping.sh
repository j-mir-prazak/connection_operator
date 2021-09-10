#!/bin/bash


ping -W3 -c1 139.162.251.161 2>&1 1>/dev/null
EXIT=$?

if [[ "$EXIT" == 0 ]]; then
	exit 0;
else
	exit 1;
fi
