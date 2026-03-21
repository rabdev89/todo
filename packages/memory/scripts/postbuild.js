const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'src', 'database', 'migrations');
const dest = path.join(__dirname, '..', 'dist', 'database');
fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true });
