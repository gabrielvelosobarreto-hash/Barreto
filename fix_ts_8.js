const fs = require('fs');
const file = 'components/views/ShoppingListView.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/<button type="button"\n\s+key=\{p\}\n\s+type="button"/g, '<button type="button"\n                      key={p}');

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed TS error 8');
