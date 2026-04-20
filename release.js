const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const type = process.argv[2] || 'patch';

execSync(`node bump.js ${type}`, { stdio: 'inherit' });

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'electron', 'package.json'), 'utf8'));
const version = pkg.version;

execSync('node build.js', { stdio: 'inherit' });
execSync('npm run build:win', { stdio: 'inherit', cwd: path.join(__dirname, 'electron') });
execSync('npm run build:win:noflags', { stdio: 'inherit', cwd: path.join(__dirname, 'electron') });

execSync('git add .', { stdio: 'inherit' });
execSync(`git commit -m "v${version}"`, { stdio: 'inherit' });
execSync('git push origin main', { stdio: 'inherit' });

console.log(`\n✅ Released v${version}`);