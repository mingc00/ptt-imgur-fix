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

  function getNewElements(elements) {
    const results = [];
    for (const e of elements) {
      if (!processed.get(e)) {
        processed.set(e);
        results.push(e);
      }
    }
    return results;
  }

  function onUpdate() {
    const as = getNewElements(container.querySelectorAll(`a`));
    const targets = as.filter(
      (a) =>
        a.href.startsWith("https://pbs.twimg.com/") ||
        a.href.startsWith("https://live.staticflickr.com/")
    );
    const albumAnchors = as
      .map((a) => {
        const hash = a.href.match(
          /https?:\/\/(?:m\.)?imgur.com\/(?:a|gallery)\/(\w+)/
        )?.[1];
        return hash ? [a, hash] : null;
      })
      .filter((e) => e);

    const videoImgs = getNewElements(
      container.querySelectorAll('img.hyperLinkPreview[src$=".mp4"]')
    );

    if (
      targets.length === 0 &&
      albumAnchors.length === 0 &&
      videoImgs.length === 0
    ) {
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

    albumAnchors.forEach(async ([a, hash]) => {
      const div = getPreviewContainer(a);
      while (div.firstChild) {
        div.removeChild(div.lastChild);
      }
      const links = await resolveAlbum(hash);
      for (const link of links) {
        div.appendChild(createImage(link));
      }
    });

    videoImgs.forEach((img) => {
      const videoEl = document.createElement("video");
      videoEl.src = img.src;
      videoEl.classList.add("hyperLinkPreview");
      videoEl.controls = true;
      img.parentNode.replaceChild(videoEl, img);
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
