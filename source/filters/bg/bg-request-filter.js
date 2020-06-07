/*
  This filter rewrites requests for background images with a given
  query parameter and replaces them with user-specified backgrounds.
*/
createRewriteFilter("Bg Request", "https://tetr.io/res/bg/*", {
  enabledFor: async url => {
    let match = /\?bgId=([^&]+)/.exec(url);
    if (!match) {
      console.log("[Bg Request filter] Ignoring, no bg ID:", url);
      return false;
    }
    return true;
  },
  onStart: async (url, src, callback) => {
    let [_, bgId] = /\?bgId=([^&]+)/.exec(url);
    console.log("[Bg Request filter] Background ID", bgId);

    if (bgId == 'animated') {
      let res = await browser.storage.local.get('animatedBackground');
      let animBg = res.animatedBackground;
      if (!animBg) return;
      let key = 'background-' + animBg.id;
      let value = (await browser.storage.local.get(key))[key];
      callback({
        type: dataUriMime(value),
        data: value,
        encoding: 'base64-data-url'
      });
      // filter.write(convertDataURIToBinary(value[key]));
      return;
    }

    if (bgId == 'transparent') {
      callback({
        type: 'image/png',
        data:
          // 1x1 transparent pixel
          `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ` +
          `AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH5A` +
          `QWBjQ7z1871gAAAAtJREFUCNdjYAACAAAFAAHiJgWbAAAAAElFTkSuQmCC`,
        encoding: 'base64-data-url'
      });
      // filter.write(value);
      return;
    }

    let key = `background-${bgId}`;
    let value = (await browser.storage.local.get(key))[key];
    callback({
      type: dataUriMime(value),
      data: value,
      encoding: 'base64-data-url'
    });
  }
});

function dataUriMime(uri) {
  return /^data:([^;]+);/.exec(uri)[1];
}

// https://gist.github.com/borismus/1032746
var BASE64_MARKER = ';base64,';
function convertDataURIToBinary(dataURI) {
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var raw = atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}
