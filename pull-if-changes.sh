#!/bin/sh

changed=0
git remote update && git status -uno | grep -q 'Your branch is behind' && changed=1
if [ $changed = 1 ]; then
    git pull
    # Full install (not --omit=dev): terser/clean-css are devDependencies,
    # needed right below to build public-dist/. It's regenerated on every
    # deploy now (see scripts/build-assets.js) instead of being committed,
    # so there's no separate "remember to rebuild before pushing" step.
    sudo runuser -l ubuntu -c 'cd '"$(pwd)"' && npm install && npm run build:assets'
    sudo runuser -l ubuntu -c 'NODE_ENV=production pm2 reload all'
fi