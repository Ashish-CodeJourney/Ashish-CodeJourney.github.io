const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatPoint = (value) => {
  const [year, month] = value.split('-');
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
};

export const formatPeriod = ({ start, end }) => `${formatPoint(start)} to ${end ? formatPoint(end) : 'present'}`;

export const byNewestStart = (a, b) => b.start.localeCompare(a.start);

const KB = 1024;
const MB = KB * 1024;

export const formatFileSize = (bytes) =>
  bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / KB))} KB`;
