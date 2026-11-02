const GREETINGS = [
  { from: 5, text: "Good morning, I'm" },
  { from: 12, text: "Good afternoon, I'm" },
  { from: 17, text: "Good evening, I'm" },
  { from: 22, text: "Hello, night owl. I'm" },
];

export const greetingFor = (hour) =>
  GREETINGS.findLast(({ from }) => hour >= from)?.text ?? GREETINGS.at(-1).text;
