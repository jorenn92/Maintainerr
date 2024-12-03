#!/bin/sh

echo "Welcome to the Maintainerr installation script!"
echo "This script can only be ran once. If you need to re-run it, please delete the installation directory and extract the archive again."
echo "The user running this script must have write permissions to the installation directory."

# Ask the user to confirm and check the input:
echo "Do you want to continue with the installation? (y/n):"

read CONTINUE

if [ "$CONTINUE" != "y" ]; then
  echo "Exiting..."
  exit 1
fi

echo "Are you hosting Maintainerr under a subfolder? If so, please provide the subfolder (e.g. /maintainerr) or press ENTER to continue without a subfolder:"

read BASE_PATH

if [ -n "$BASE_PATH" ]; then
  if [ "${BASE_PATH:0:1}" != "/" ]; then
    echo "The subfolder must start with a slash. Exiting..."
    exit 1
  fi

  # Remove trailing slash if present
  BASE_PATH=${BASE_PATH%/}
fi

find ./ui -type f -not -path '*/node_modules/*' -print0 | xargs -0 sed -i "s,/__PATH_PREFIX__,$BASE_PATH,g"

echo "Subfolder configuration set."

echo "You must now manually update the server/.env and ui/.env files with your configuration."