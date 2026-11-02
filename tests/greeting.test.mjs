import test from 'node:test';
import assert from 'node:assert/strict';
import { greetingFor } from '../src/utils/greeting.js';

test('mornings run from 5am to before noon and lead into my name', () => {
  assert.equal(greetingFor(5), "Good morning, I'm");
  assert.equal(greetingFor(11), "Good morning, I'm");
});

test('afternoons run from noon to before 5pm', () => {
  assert.equal(greetingFor(12), "Good afternoon, I'm");
  assert.equal(greetingFor(16), "Good afternoon, I'm");
});

test('evenings run from 5pm to before 10pm', () => {
  assert.equal(greetingFor(17), "Good evening, I'm");
  assert.equal(greetingFor(21), "Good evening, I'm");
});

test('late night readers get a nod', () => {
  assert.equal(greetingFor(22), "Hello, night owl. I'm");
  assert.equal(greetingFor(0), "Hello, night owl. I'm");
  assert.equal(greetingFor(4), "Hello, night owl. I'm");
});
