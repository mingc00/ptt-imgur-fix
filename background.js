chrome.webRequest.onBeforeSendHeaders.addListener(
  function removeReferer(details) {
    for (let i = 0; i < details.requestHeaders.length; i++) {
      const header = details.requestHeaders[i];
      if (header.name === "Referer") {
        details.requestHeaders.splice(i, 1);
        break;
      }
    }
    return { requestHeaders: details.requestHeaders };
  },
  { urls: ["https://*.imgur.com/*"], types: ["image"] },
  ["blocking", "requestHeaders"].concat(chrome.app ? ["extraHeaders"] : [])
);

chrome.webRequest.onBeforeRequest.addListener(
  function redirectToWebP(details) {
    const source = details.initiator || details.originUrl;
    if (!source.startsWith("https://term.ptt.cc")) {
      return;
    }
    const { url } = details;
    const m = url.match(/\.(jpg|png)$/);
    if (m) {
      return { redirectUrl: url.slice(0, m.index) + ".webp" };
    }
  },
  { urls: ["https://i.imgur.com/*"], types: ["image"] },
  ["blocking"]
);
