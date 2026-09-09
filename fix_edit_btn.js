const fs = require('fs');
const file = 'components/views/ShoppingListView.tsx';
let data = fs.readFileSync(file, 'utf8');

// Replace new variables with correct ones in button onClick
data = data.replace(/setNewItemQuantity\(item\.quantity \|\| 1\);/g, '');
data = data.replace(/setNewItemCategory\(item\.categoryId \|\| 'none'\);/g, 'setNewItemCat(item.categoryId || \'Alimentos\');');
data = data.replace(/setNewItemCategory\('none'\);/g, 'setNewItemCat(\'Alimentos\');');
data = data.replace(/setNewItemQuantity\(1\);/g, '');

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed ShoppingListView button handlers');
