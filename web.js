const links = document.querySelectorAll('a[href*="//imgur.com"]');

function createDiv(...classes) {
  const div = document.createElement("div");
  div.classList.add(...classes);
  return div;
}

function insertPreview(anchor, el) {
  const div = createDiv("richcontent");
  div.appendChild(el);
  anchor.parentNode.insertBefore(div, anchor.nextSibling);
}

const albums = [];
const unknownHashes = [];

for (const a of links) {
  const url = new URL(a.href);
  const { pathname } = url;
  let match = null;
  if ((match = pathname.match(/^\/(?:a|gallery)\/(\w+)/))) {
    albums.push([a, match[1]]);
  } else if ((match = pathname.match(/^\/(\w+)$/))) {
    unknownHashes.push([a, match[1]]);
  }
}

albums.forEach(async ([a, hash]) => {
  const links = await resolveAlbum(hash);
  for (const link of links.reverse()) {
    insertPreview(a, createImageEl(link));
  }
});

unknownHashes.forEach(async ([a, hash]) => {
  const { type, link } = await resolveUnknown(hash);
  let el = null;
  if (type.startsWith('video/')) {
    el = createVideoEl(link);
  } else if (type.startsWith('image/')) {
    el = createImageEl(link);
  }
  if (el) {
    insertPreview(a, el);
  }
});

for (const a of document.querySelectorAll('a[href^="https://clips.twitch.tv"]')) {
  const url = new URL(a.href);
  const iframe = document.createElement("iframe");
  iframe.classList.add("youtube-player");
  iframe.type = "text/html";
  iframe.src = `https://clips.twitch.tv/embed?clip=${url.pathname.slice(1)}&parent=www.ptt.cc`;
  iframe.allowFullscreen = true;
  iframe.style.border = "none";
  const contentDiv = createDiv("resize-content");
  contentDiv.appendChild(iframe);
  const container = createDiv('resize-container');
  container.appendChild(contentDiv);
  insertPreview(a, container);
}

for (const a of document.querySelectorAll('a[href^="https://pbs.twimg.com/media/"][href*="?format="]')) {
  insertPreview(a, createImageEl(a.href));
}

function fixBrokenCache(img) {
  const path = new URL(img.src).pathname;
  const originalURL = path.replace(/^\/c\/https\//, 'https://');
  img.src = originalURL;
}

const cacheLink = document.querySelectorAll('img[src^="https://cache.ptt.cc"]');
for (const img of cacheLink) {
  fixBrokenCache(img);
}