const GREETINGS = [
  { from: 5, text: 'Good morning.' },
  { from: 12, text: 'Good afternoon.' },
  { from: 17, text: 'Good evening.' },
  { from: 22, text: 'Up late? Same here.' },
];

export const greetingFor = (hour) =>
  GREETINGS.findLast(({ from }) => hour >= from)?.text ?? GREETINGS.at(-1).text;
