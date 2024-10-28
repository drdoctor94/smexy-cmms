#!/bin/bash

# Define the variables
REMOTE_USER="root"
REMOTE_HOST="143.198.73.222"
REMOTE_DIR="/var/www/smexy-cmms/cmms-frontend/build"
LOCAL_BUILD_DIR="./build"

# Step 1: Build your app locally
echo "Building your app..."
REACT_APP_API_URL=https://flexcmms.com npm run build  # Or use yarn build, depending on your setup

# Step 2: Sync the build folder to the server
echo "Deploying the build folder to the server..."
rsync -avz --delete $LOCAL_BUILD_DIR/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR

# Step 3: Restart the web server to reflect the changes (if necessary)
# Uncomment if your server requires a restart after deployment
# ssh $REMOTE_USER@$REMOTE_HOST "sudo systemctl restart nginx"

echo "Deployment complete!"
