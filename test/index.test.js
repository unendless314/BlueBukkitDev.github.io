const test = require('node:test');
const assert = require('node:assert');

const { degToRad, radToDeg, normalizeDegrees } = require('../angles');

test('degToRad converts degrees to radians', () => {
  assert.strictEqual(degToRad(180), Math.PI);
});

test('radToDeg converts radians to degrees', () => {
  assert.strictEqual(radToDeg(Math.PI), 180);
});

test('normalizeDegrees handles negative values', () => {
  assert.strictEqual(normalizeDegrees(-90), 270);
});

test('normalizeDegrees handles values over 360', () => {
  assert.strictEqual(normalizeDegrees(450), 90);
});
