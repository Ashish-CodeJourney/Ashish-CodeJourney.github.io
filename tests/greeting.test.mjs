import test from 'node:test';
import assert from 'node:assert/strict';
import { greetingFor } from '../src/utils/greeting.js';

test('mornings run from 5am to before noon', () => {
  assert.equal(greetingFor(5), 'Good morning.');
  assert.equal(greetingFor(11), 'Good morning.');
});

test('afternoons run from noon to before 5pm', () => {
  assert.equal(greetingFor(12), 'Good afternoon.');
  assert.equal(greetingFor(16), 'Good afternoon.');
});

test('evenings run from 5pm to before 10pm', () => {
  assert.equal(greetingFor(17), 'Good evening.');
  assert.equal(greetingFor(21), 'Good evening.');
});

test('late night readers get a nod', () => {
  assert.equal(greetingFor(22), 'Up late? Same here.');
  assert.equal(greetingFor(0), 'Up late? Same here.');
  assert.equal(greetingFor(4), 'Up late? Same here.');
});
