const fs = require('fs');
fs.cpSync('src/generated', 'dist/generated', { recursive: true });
