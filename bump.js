const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const type = args[0];

if (!['patch', 'minor', 'major'].includes(type)) {
    console.error('Usage: node bump.js [patch|minor|major]');
    process.exit(1);
}

const pkgPath = path.join(__dirname, 'electron', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);

let newVersion;
if (type === 'major') newVersion = `${major + 1}.0.0`;
else if (type === 'minor') newVersion = `${major}.${minor + 1}.0`;
else newVersion = `${major}.${minor}.${patch + 1}`;

// Update electron/package.json
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// Update APP_VERSION in src/data/core.js
const corePath = path.join(__dirname, 'src', 'data', 'core.js');
let coreJs = fs.readFileSync(corePath, 'utf8');
coreJs = coreJs.replace(/const APP_VERSION = 'v[\d.]+';/, `const APP_VERSION = 'v${newVersion}';`);
fs.writeFileSync(corePath, coreJs);

console.log(`Version bumped to v${newVersion}`);