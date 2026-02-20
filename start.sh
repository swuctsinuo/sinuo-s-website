#!/bin/bash

# Personal Website Starter Script
echo "🚀 Starting Sinuo's Personal Website..."

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Open the website in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$DIR/index.html"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "$DIR/index.html"
else
    # Windows or other
    start "$DIR/index.html"
fi

echo "✨ Website opened successfully!"
echo "📍 Location: $DIR/index.html"
