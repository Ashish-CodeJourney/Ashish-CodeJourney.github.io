import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutNecklace, promenadePath } from '../src/utils/necklace.js';

const piece = (overrides = {}) => ({
  href: '/technical/a/',
  title: 'A post',
  date: '2026-01-01',
  kind: 'technical',
  ...overrides,
});

const VIEW = { width: 1000, height: 200 };

test('no published pieces means no lights', () => {
  assert.deepEqual(layoutNecklace({ pieces: [], ...VIEW }), []);
});

test('lights run oldest on the left to newest on the right', () => {
  const lights = layoutNecklace({
    pieces: [
      piece({ title: 'Newest', date: '2026-09-01' }),
      piece({ title: 'Oldest', date: '2024-01-01' }),
      piece({ title: 'Middle', date: '2025-05-05' }),
    ],
    ...VIEW,
  });

  assert.deepEqual(lights.map((light) => light.title), ['Oldest', 'Middle', 'Newest']);
  assert.ok(lights[0].x < lights[1].x && lights[1].x < lights[2].x);
});

test('lights keep the link, title, date and kind of their piece', () => {
  const [light] = layoutNecklace({
    pieces: [piece({ href: '/writings/sea/', title: 'Sea', date: '2026-02-02', kind: 'writing' })],
    ...VIEW,
  });

  assert.equal(light.href, '/writings/sea/');
  assert.equal(light.title, 'Sea');
  assert.equal(light.date, '2026-02-02');
  assert.equal(light.kind, 'writing');
});

test('a single light sits at the middle of the promenade', () => {
  const [light] = layoutNecklace({ pieces: [piece()], ...VIEW });
  assert.equal(light.x, 500);
});

test('lights stay inside the drawing with breathing room at both ends', () => {
  const pieces = Array.from({ length: 40 }, (_, i) => piece({ date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`, title: `P${i}` }));
  const lights = layoutNecklace({ pieces, ...VIEW });

  assert.equal(lights.length, 40);
  lights.forEach(({ x, y }) => {
    assert.ok(x >= 40 && x <= 960, `x=${x} out of bounds`);
    assert.ok(y >= 0 && y <= VIEW.height, `y=${y} out of bounds`);
  });
});

test('lights sit on the promenade curve, which dips toward the sea in the middle', () => {
  const lights = layoutNecklace({
    pieces: [piece({ date: '2024-01-01' }), piece({ date: '2025-01-01' }), piece({ date: '2026-01-01' })],
    ...VIEW,
  });

  assert.ok(lights[1].y > lights[0].y);
  assert.ok(lights[1].y > lights[2].y);
});

test('same-day pieces keep a stable order by title', () => {
  const lights = layoutNecklace({
    pieces: [piece({ title: 'Beta', date: '2026-03-03' }), piece({ title: 'Alpha', date: '2026-03-03' })],
    ...VIEW,
  });
  assert.deepEqual(lights.map((light) => light.title), ['Alpha', 'Beta']);
});

test('input pieces are not mutated', () => {
  const pieces = Object.freeze([piece({ date: '2026-02-01' }), piece({ date: '2025-02-01' })]);
  assert.doesNotThrow(() => layoutNecklace({ pieces, ...VIEW }));
});

test('promenade path is an SVG quadratic curve spanning the full width', () => {
  assert.match(promenadePath(VIEW), /^M0 [\d.]+ Q500 [\d.]+ 1000 [\d.]+$/);
});
