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
  { urls: ["https://*.imgur.com/*"], types: ["image", "media"] },
  ["blocking", "requestHeaders"].concat(chrome.app ? ["extraHeaders"] : [])
);
