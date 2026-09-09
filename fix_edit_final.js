const fs = require('fs');
const file = 'components/views/ShoppingListView.tsx';
let data = fs.readFileSync(file, 'utf8');

// Use correct property names
data = data.replace(/setNewItemCat\(item\.categoryId \|\| 'none'\);/g, 'setNewItemCat(item.category || \'Alimentos\');');
data = data.replace(/categoryId: newItemCat,/g, 'category: newItemCat,');

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed ShoppingItem properties');
