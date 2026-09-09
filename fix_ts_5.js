const fs = require('fs');
const file = 'components/views/ShoppingListView.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/<button type="button"\n            type="button"/g, '<button type="button"');

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed TS error 5');
