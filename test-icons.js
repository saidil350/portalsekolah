const fs = require('fs');
const path = require('path');
const d = './public';
const files = fs.readdirSync(d).filter(f => f.endsWith('.svg') && f.length > 20);
const out = files.map(f => {
    const s = fs.readFileSync(path.join(d, f), 'utf8');
    return `// ${f}\n${s}`;
}).join('\n\n');
fs.writeFileSync('svgs_dump.txt', out);
