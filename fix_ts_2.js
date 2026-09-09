const fs = require('fs');
const file = 'components/views/PrioritiesView.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/const openEditModal = \(item\) =>/g, 'const openEditModal = (item: any) =>');

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed TS error 2');
