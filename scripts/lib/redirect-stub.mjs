const toOrigin = (targetOrigin) => {
  const url = new URL(targetOrigin);
  if (url.protocol !== 'https:') {
    throw new Error(`Redirect target must be https, got: ${targetOrigin}`);
  }
  return url.origin;
};

export const buildRedirectPage = ({ targetOrigin }) => {
  const origin = toOrigin(targetOrigin);
  const home = `${origin}/`;
  const host = new URL(origin).host;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved to ${host}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${home}">
<script>location.replace(${JSON.stringify(origin)} + location.pathname + location.search + location.hash);</script>
<noscript><meta http-equiv="refresh" content="0; url=${home}"></noscript>
</head>
<body>
<p>This site has moved to <a href="${home}">${host}</a>.</p>
</body>
</html>
`;
};
