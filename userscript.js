const links = document.querySelectorAll('a[href^="https://imgur.com"]');

// debugger;
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
  if ((match = pathname.match(/^\/a\/(\w+)/))) {
    albums.push({ dom: a, hash: match[1] });
  } else if ((match = pathname.match(/^\/(\w+)$/))) {
    createPreview(a, `https://i.imgur.com/${match[1]}.jpg`);
  }
}

albums.forEach(async ({ dom: a, hash }) => {
  try {
    const response = await fetch(
      `https://api.imgur.com/3/album/${hash}?client_id=be82c350cb8d1c6`,
      {
        method: "GET",
        mode: "cors",
        referrerPolicy: "no-referrer",
      }
    );

    const {
      data: { images },
    } = await response.json();

    for (const { link } of images.reverse()) {
      createPreview(a, link);
    }
  } catch (e) {
    console.error(e);
  }
});
