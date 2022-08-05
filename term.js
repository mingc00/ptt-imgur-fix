function isEasyReadingEnabled() {
  try {
    const pref = JSON.parse(localStorage["pttchrome.pref.v1"]);
    return pref.values.enableEasyReading;
  } catch (e) {
    console.error(e);
  }
  return false;
}

let isEnabled = isEasyReadingEnabled();

new MutationObserver((records) => {
  for (const record of records) {
    for (const node of record.removedNodes) {
      if (node.role === 'dialog') {
        isEnabled = isEasyReadingEnabled();
        return;
      }
    }
  }
}).observe(document.body, { childList: true });


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

  function createGif(url) {
    const video = document.createElement("video");
    video.classList.add("easyReadingImg", "hyperLinkPreview");
    video.src = url.replace(/\.gif$/, ".mp4");
    video.loop = true;
    video.autoplay = true;
    video.controls = false;
    return video;
  }

  const processed = new WeakSet();

  function getNewElements(elements) {
    const results = [];
    for (const e of elements) {
      if (!processed.has(e)) {
        processed.add(e);
        results.push(e);
      }
    }
    return results;
  }

  function onUpdate() {
    if (!isEnabled) {
      timer = null;
      return;
    }

    const as = getNewElements(container.querySelectorAll("a"));
    const targets = as.filter(
      (a) =>
        a.href.startsWith("https://pbs.twimg.com/") ||
        a.href.startsWith("https://live.staticflickr.com/") ||
        a.href.startsWith("https://pic.pimg.tw/") ||
        a.href.startsWith("https://i.pixiv.cat/")
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

    const ytAnchors = as
      .map((a) => {
        const id = a.href.match(
          /https:\/\/(?:youtu\.be\/|www\.youtube\.com\/watch\?v=)([\w-]+)/
        )?.[1];
        return id ? [a, id] : null;
      })
      .filter((e) => e);

    if (
      targets.length === 0 &&
      albumAnchors.length === 0 &&
      videoImgs.length === 0 &&
      ytAnchors.length === 0
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
        div.appendChild(
          link.endsWith(".gif") ? createGif(link) : createImage(link)
        );
      }
    });

    videoImgs.forEach((img) => {
      const videoEl = document.createElement("video");
      videoEl.src = img.src;
      videoEl.classList.add("easyReadingImg", "hyperLinkPreview");
      videoEl.controls = true;
      img.parentNode.replaceChild(videoEl, img);
    });

    ytAnchors.forEach(([a, id]) => {
      const div = getPreviewContainer(a);
      if (!div || div.childNodes.length !== 0) {
        return;
      }
      const container = document.createElement("div");
      container.style.margin = "0.5em auto";
      container.style.maxWidth = "800px";
      container.style.height = "450px";
      const iframe = document.createElement("iframe");
      iframe.type = "text/html";
      iframe.src = `//www.youtube.com/embed/${id}`;
      iframe.style.border = "none";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "origin-when-cross-origin";
      container.appendChild(iframe);
      div.appendChild(container);
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

registerObserver();