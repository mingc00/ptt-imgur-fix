function isEasyReadingEnabled() {
  try {
    const pref = JSON.parse(localStorage["pttchrome.pref.v1"]);
    return pref.values.enableEasyReading;
  } catch (e) {
    console.error(e);
  }
  return false;
}

function registerObserver() {
  const container = document.getElementById("mainContainer");
  if (!container) {
    setTimeout(registerObserver, 1000);
    return;
  }

  const config = {
    childList: true,
    subtree: true,
  };

  let timer = null;

  function createImage(url) {
    const img = document.createElement("img");
    img.classList.add("easyReadingImg", "hyperLinkPreview");
    img.referrerPolicy = "no-referrer";
    img.src = url;
    return img;
  }

  const processed = new WeakMap();

  function onUpdate() {
    const as = [...container.querySelectorAll(`a`)].filter(
      (a) => !processed.get(a)
    );
    as.forEach((a) => {
      processed.set(a, true);
    });

    const targets = as.filter(
      (a) =>
        a.href.startsWith("https://pbs.twimg.com/") ||
        a.href.startsWith("https://live.staticflickr.com/")
    );
    const albumAnchors = as.filter(
      (a) =>
        a.href.startsWith("https://imgur.com/a/") ||
        a.href.startsWith("https://m.imgur.com/a/")
    );

    if (targets.length === 0 && albumAnchors.length === 0) {
      timer = null;
      return;
    }

    function getPreviewContainer(a) {
      return a.parentNode.nextSibling;
    }
    observer.disconnect();
    targets.forEach((a) => {
      const div = getPreviewContainer(a);
      if (!div || div.childNodes.length !== 0) {
        return;
      }
      div.appendChild(createImage(a.href));
    });

    albumAnchors.forEach(async (a) => {
      const div = getPreviewContainer(a);
      const match = a.href.match(/https:\/\/(?:m\.)?imgur.com\/a\/(\w+)/);
      if (!match) {
        return;
      }
      while (div.firstChild) {
        div.removeChild(div.lastChild);
      }
      const links = await resolveAlbum(match[1]);
      for (const link of links) {
        div.appendChild(createImage(link));
      }
    });

    observer.observe(container, config);
    timer = null;
  }

  const observer = new MutationObserver(function () {
    if (!timer) {
      timer = setTimeout(onUpdate, 50);
    }
  });
  observer.observe(container, config);
}

if (isEasyReadingEnabled()) {
  registerObserver();
}
