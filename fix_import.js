const fs = require('fs');
let data = fs.readFileSync('components/views/PrioritiesView.tsx', 'utf8');
data = data.replace(/import Image from 'next\/image';\n/g, '');
fs.writeFileSync('components/views/PrioritiesView.tsx', data);
