async function resolveAlbum(hash) {
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

    return images.map((img) => img.link);
  } catch (e) {
    console.error(e);
    return [];
  }
}
