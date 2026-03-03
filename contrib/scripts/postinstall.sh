#!/bin/sh
# Notify users how to enable the daemon after package install.
echo ""
echo "tilbo installed. To start the daemon for your user:"
echo "  systemctl --user daemon-reload"
echo "  systemctl --user enable --now tilbo-daemon"
echo ""
