'use strict';

const fs = require('fs');
const path = require('path');

const rulesDir = path.join(__dirname, 'rules');
const registry = {};

fs.readdirSync(rulesDir)
  .filter((f) => f.endsWith('.js'))
  .forEach((f) => {
    const rule = require(path.join(rulesDir, f));
    if (!rule.key || typeof rule.evaluate !== 'function') {
      throw new Error(
        `Invalid segment rule in ${f}: must export { key, name, description, evaluate() }`
      );
    }
    if (registry[rule.key]) {
      throw new Error(`Duplicate segment key: ${rule.key} (file: ${f})`);
    }
    registry[rule.key] = rule;
  });

module.exports = registry;
