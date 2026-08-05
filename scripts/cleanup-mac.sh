#!/bin/bash

echo "=== Clash Meta For Windows Cleanup Tool ==="
echo "This script will remove all Clash Meta For Windows related files and services."
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Stop and unload services
echo "Stopping services..."
sudo launchctl unload /Library/LaunchDaemons/party.mihomo.helper.plist 2>/dev/null || true

# Remove files
echo "Removing files..."
sudo rm -f /Library/LaunchDaemons/party.mihomo.helper.plist
sudo rm -f /Library/PrivilegedHelperTools/party.mihomo.helper
sudo rm -rf "/Applications/Clash Meta.app"
sudo rm -rf "/Applications/Clash\\ Meta.app"
sudo rm -rf ~/Library/Application\ Support/clash-meta
sudo rm -rf ~/Library/Caches/clash-meta
sudo rm -f ~/Library/Preferences/party.mihomo.app.helper.plist
sudo rm -f ~/Library/Preferences/party.mihomo.app.plist

echo "Cleanup complete. Please restart your computer to complete the process."
