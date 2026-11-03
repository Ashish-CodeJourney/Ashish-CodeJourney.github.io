export const inviteMailto = ({ email, subject }) => `mailto:${email}?subject=${encodeURIComponent(subject)}`;

export const isPastEvent = ({ date, today }) => date < today.toISOString().slice(0, 10);
