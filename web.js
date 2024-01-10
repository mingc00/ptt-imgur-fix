const links = document.querySelectorAll('a[href^="https://imgur.com"]');

function insertPreview(anchor, el) {
  const div = document.createElement("div");
  div.classList.add("richcontent");
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