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

  function createImage(url) {
    const img = createImageEl(url);
    img.classList.add("easyReadingImg", "hyperLinkPreview");
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

  function createIframe(src) {
    const container = document.createElement("div");
    container.style.margin = "0.5em auto";
    container.style.maxWidth = "800px";
    container.style.height = "450px";

    const iframe = document.createElement("iframe");
    iframe.type = "text/html";
    iframe.src = src;
    iframe.style.border = "none";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "origin-when-cross-origin";
    container.appendChild(iframe);
    return container;
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

  function getPreviewContainer(a) {
    return a.parentNode.nextSibling;
  }

  function onUpdate() {
    if (!isEnabled) {
      return;
    }

    if (!container.querySelector('.q4.b7')) {
      return;
    }

    const as = getNewElements(container.querySelectorAll("a"));
    const targets = as.filter(
      (a) =>
        /(png|jpeg|jpg|gif)$/i.test(a.href)
    ).filter((a) => {
      const container = getPreviewContainer(a);
      return container && !container.firstChild;
    });
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

    const twitchAnchors = as
      .map((a) => {
        const id = a.href.match(/https:\/\/clips\.twitch\.tv\/([\w-]+)/)?.[1];
        return id ? [a, id] : null;
      }).filter((e) => e);

    if (
      targets.length === 0 &&
      albumAnchors.length === 0 &&
      videoImgs.length === 0 &&
      ytAnchors.length === 0 &&
      twitchAnchors.length === 0
    ) {
      return;
    }

    observer.disconnect();
    targets.forEach((a) => {
      const div = getPreviewContainer(a);
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

    twitchAnchors.forEach(([a, id]) => {
      const div = getPreviewContainer(a);
      if (!div || div.childNodes.length !== 0) {
        return;
      }
      const container = createIframe(`https://clips.twitch.tv/embed?clip=${id}&parent=term.ptt.cc`);
      div.appendChild(container);
    });

    observer.observe(container, config);
  }

  let timer = null;
  const observer = new MutationObserver(function () {
    if (!timer) {
      timer = setTimeout(() => {
        onUpdate();
        timer = null;
      }, 50);
    }
  });
  observer.observe(container, config);
}

registerObserver();