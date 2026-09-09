const fs = require('fs');
const file = 'components/views/ShoppingListView.tsx';
let data = fs.readFileSync(file, 'utf8');

// Replace new variables with correct ones
data = data.replace(/newItemCategory/g, 'newItemCat');
data = data.replace(/setNewItemCategory/g, 'setNewItemCat');

// Remove setNewItemQuantity and newItemQuantity completely
data = data.replace(/setNewItemQuantity\(1\);/g, '');
data = data.replace(/setNewItemQuantity\(item\.quantity \|\| 1\);/g, '');
data = data.replace(/quantity: newItemQuantity,/g, '');

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed ShoppingListView variables');
