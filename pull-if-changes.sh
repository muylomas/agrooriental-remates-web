#!/bin/sh

# Runs every 5 minutes via cron AND can be run by hand — this lock stops the
# two from ever overlapping. Without it, a manual run landing near a cron
# tick could have both racing to rm+rebuild public-dist/ at the same time,
# leaving it half-written (this happened once — see git history).
exec 9>/tmp/pull-if-changes.lock
flock -n 9 || exit 0

changed=0
git remote update && git status -uno | grep -q 'Your branch is behind' && changed=1
if [ $changed = 1 ]; then
    git pull
    # Full install (not --omit=dev): terser/clean-css are devDependencies,
    # needed right below to build public-dist/. It's regenerated on every
    # deploy now (see scripts/build-assets.js) instead of being committed,
    # so there's no separate "remember to rebuild before pushing" step.
    if sudo runuser -l ubuntu -c 'cd '"$(pwd)"' && npm install && npm run build:assets'; then
        sudo runuser -l ubuntu -c 'NODE_ENV=production pm2 reload all'
    else
        echo "pull-if-changes: build failed, skipping pm2 reload (old process keeps serving)" >&2
    fi
fi
