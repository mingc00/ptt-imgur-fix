function modifyBody(body) {
  return body.replace('</body>', function(match) {
    return `<script src="https://cdn.jsdelivr.net/gh/mingc00/ptt-imgur-fix@main/imgur.js"></script><script src="https://cdn.jsdelivr.net/gh/mingc00/ptt-imgur-fix@main/web.js"></script>`
      + match;
  });
}

const contentType = $response.headers['Content-Type'] || $response.headers['content-type'];
if (contentType?.startsWith('text/html')) {
  $done({ body: modifyBody($response.body) });
} else {
  $done();
}
