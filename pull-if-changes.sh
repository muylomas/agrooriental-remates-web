#!/bin/sh

changed=0
git remote update && git status -uno | grep -q 'Your branch is behind' && changed=1
if [ $changed = 1 ]; then
    git pull
    sudo runuser -l ubuntu -c 'NODE_ENV=production pm2 reload all'
fi