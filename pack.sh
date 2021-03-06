#!/bin/bash
# Ignore any electron-or-metadata-specific content
find -type f |\
  grep -Ev 'node_modules|\.zip|\.git|electron|package(-lock)?\.json|desktop-manifest\.js|pack.sh' |\
  zip -r tetrioplus.zip.xpi -9 -u -@
