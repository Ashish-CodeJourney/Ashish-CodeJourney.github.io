const START_Y = 0.3;
const SAG_Y = 1.2;
const END_Y = 0.2;
const EDGE = 0.04;

const round = (value) => Math.round(value * 10) / 10;

const curveY = ({ t, height }) =>
  (1 - t) ** 2 * START_Y * height + 2 * (1 - t) * t * SAG_Y * height + t ** 2 * END_Y * height;

const byDateThenTitle = (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title);

const positionAt = ({ index, count }) => (count === 1 ? 0.5 : EDGE + ((1 - 2 * EDGE) * index) / (count - 1));

export const promenadePath = ({ width, height }) =>
  `M0 ${round(START_Y * height)} Q${round(width / 2)} ${round(SAG_Y * height)} ${round(width)} ${round(END_Y * height)}`;

export const layoutNecklace = ({ pieces, width, height }) =>
  [...pieces].sort(byDateThenTitle).map((piece, index, sorted) => {
    const t = positionAt({ index, count: sorted.length });
    return { ...piece, x: round(width * t), y: round(curveY({ t, height })) };
  });
