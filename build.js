const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

const SCRIPTS = [
    'src/data/core.js',
    'src/data/sponsors.js',
    'src/data/drama.js',
    'src/data/names.js',
    'src/data/supplemental.js',
    'src/logic/core.js',
    'src/logic/schedule.js',
    'src/logic/contracts.js',
    'src/logic/paddock.js',
    'src/logic/drivers.js',
    'src/logic/state.js',
    'src/logic/race.js',
    'src/logic/season.js',
    'src/ui/core.js',
    'src/ui/dashboard.js',
    'src/ui/contracts.js',
    'src/ui/schedule.js',
    'src/ui/rivals.js',
    'src/ui/standings.js',
    'src/ui/team.js',
    'src/ui/records.js',
    'src/ui/settings.js',
    'src/ui/story.js',
    'src/actions/core.js',
    'src/actions/season.js',
    'src/actions/race.js',
    'src/actions/misc.js',
    'src/bridge.js',
];

function build() {
    const shellPath = path.join(ROOT, 'shell.html');
    if (!fs.existsSync(shellPath)) {
        console.error('ERROR: shell.html not found. Did you create it?');
        process.exit(1);
    }
    let shell = fs.readFileSync(shellPath, 'utf8');

    let combined = '\n';
    for (const relPath of SCRIPTS) {
        const fullPath = path.join(ROOT, relPath);
        if (!fs.existsSync(fullPath)) {
            console.error(`ERROR: ${relPath} not found`);
            process.exit(1);
        }
        const content = fs.readFileSync(fullPath, 'utf8');
        combined += `\n// ═══ ${relPath} ═══\n`;
        combined += content;
        combined += '\n';
        console.log(`  ✓ ${relPath} (${content.split('\n').length} lines)`);
    }

    if (!shell.includes('<!-- SCRIPTS -->')) {
        console.error('ERROR: shell.html is missing the <!-- SCRIPTS --> placeholder');
        process.exit(1);
    }
    const output = shell.replace('<!-- SCRIPTS -->', function() { return '<script>' + combined + '</script>'; });

    const outPath = path.join(ROOT, 'index.html');
    fs.writeFileSync(outPath, output, 'utf8');

    const lines = output.split('\n').length;
    console.log(`\n✅ Built index.html (${lines} lines)`);
}

build();
