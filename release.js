const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const type = process.argv[2] || 'patch';

execSync(`node bump.js ${type}`, { stdio: 'inherit' });

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'electron', 'package.json'), 'utf8'));
const version = pkg.version;

execSync('node build.js', { stdio: 'inherit' });
execSync('cd electron && npm run build:win', { stdio: 'inherit' });

execSync('git add .', { stdio: 'inherit' });
execSync(`git commit -m "v${version}"`, { stdio: 'inherit' });
execSync('git push origin dev', { stdio: 'inherit' });

console.log(`\n✅ Released v${version}`);