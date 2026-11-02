const HOME = '/';
const WEB_PROTOCOLS = ['https:', 'http:'];

const parse = (url) => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

const isAllowedHost = ({ hostname, allowed }) =>
  allowed.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));

export const safeDestination = ({ url, allowed }) => {
  const parsed = url ? parse(url) : null;
  if (!parsed || !WEB_PROTOCOLS.includes(parsed.protocol)) return HOME;
  return isAllowedHost({ hostname: parsed.hostname, allowed }) ? parsed.href : HOME;
};
