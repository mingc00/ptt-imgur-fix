async function get(path) {
  const response = await fetch(
    `https://api.imgur.com/3/${path}?client_id=be82c350cb8d1c6`,
    {
      method: "GET",
      mode: "cors",
      referrerPolicy: "no-referrer",
    }
  );
  return await response.json();
}

function createVideoEl(src) {
  const videoEl = document.createElement("video");
  videoEl.src = src;
  videoEl.controls = true;
  return videoEl;
}

function createImageEl(src) {
  const imgEl = document.createElement("img");
  imgEl.referrerPolicy = "no-referrer";
  imgEl.src = src;
  return imgEl;
}

async function resolveAlbum(hash) {
  try {
    const {
      data: { images },
    } = await get(`album/${hash}`);

    return images.map((img) => img.link);
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function resolveUnknown(hash) {
  try {
    const {
      data: { type, link },
    } = await get(`image/${hash}`);
    return { type, link };
  } catch (e) {
    console.error(e);
    return { type: 'unknown' };
  }
}