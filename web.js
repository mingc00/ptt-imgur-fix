const links = document.querySelectorAll('a[href^="https://imgur.com"]');

function createPreview(a, imgURL) {
  const div = document.createElement("div");
  div.classList.add("richcontent");
  const img = document.createElement("img");
  img.referrerPolicy = "no-referrer";
  img.src = imgURL;
  div.appendChild(img);
  a.parentNode.insertBefore(div, a.nextSibling);
  return div;
}

const albums = [];

for (const a of links) {
  const url = new URL(a.href);
  const { pathname } = url;
  let match = null;
  if ((match = pathname.match(/^\/(?:a|gallery)\/(\w+)/))) {
    albums.push({ dom: a, hash: match[1] });
  } else if ((match = pathname.match(/^\/(\w+)$/))) {
    createPreview(a, `https://i.imgur.com/${match[1]}`);
  }
}

albums.forEach(async ({ dom: a, hash }) => {
  const links = await resolveAlbum(hash);
  for (const link of links.reverse()) {
    createPreview(a, link);
  }
});
