const fs = require('fs');
const path = require('path');
const manifest = JSON.parse(fs.readFileSync(
  path.join(__dirname, './manifest.json'),
  'utf8'
));
// Moved to this file since apparently "browser_specific_settings" means
// "firefox settings that firefox will complain about if you add your own entry"
manifest.browser_specific_settings.desktop_client = {
  "scripts": [
    "source/shared/migrate.js",
    "source/shared/tpse-sanitizer.js",
    "source/bootstrap/electron/migration.js",
    "source/bootstrap/domain-specific-storage-fetcher.js",

    "source/bootstrap/electron/createRewriteFilter.js",
    "source/lib/base64-recoder.js",
    "source/filters/skin/skin-tetriojs-filter.js",
    "source/filters/skin/skin-request-filter.js",
    "source/filters/bootstrap-filter.js",
    "source/filters/music-graph-hooks.js",
    "source/filters/music/music-tetriojs-filter.js",
    "source/filters/music/music-request-filter.js",
    "source/filters/sfx/sfx-request-filter.js",
    "source/filters/sfx/sfx-tetriojs-filter.js",
    "source/filters/bg/animated-bg-tetriojs-filter.js",
    "source/filters/bg/bg-request-filter.js",
    "source/filters/bg/bg-tetriojs-filter.js",
    "source/filters/touch-controls-tetriojs-filter.js",
    "source/filters/emote-tab-tetriojs-filter.js",
    "source/filters/osd-request-filter.js",
    "source/filters/debug-tetriojs-filter.js"
  ],
  "preload_scripts": [
    "source/shared/migrate.js",
    "source/shared/tpse-sanitizer.js",
    "source/bootstrap/domain-specific-storage-fetcher.js",
    "source/bootstrap/content-script-communicator.js",
    "source/content/content-script.js",
    "source/content/touch-controls.js",
    "source/content/animated-bg.js",
    "source/content/osd.js",
    "source/content/emote-tab.js",
    "source/content/music-graph-hook-handler.js",
    "source/content/custom-maps.js",
    "source/content/bgmtweak-enhancer.js"
  ],
  "inject_css": [
    "source/content/draggable-header.css",
    "source/content/touch-controls.css",
    "source/content/emote-tab.css",
    "source/content/osd.css"
  ]
};
module.exports = Object.freeze(manifest);
