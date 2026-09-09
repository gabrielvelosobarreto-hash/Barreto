const fs = require('fs');
const file = 'components/views/ShoppingListView.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /addShoppingItem\(\{\n        name: newItemName.trim\(\),\n        checked: false,\n        \n        category: newItemCat,\n        priority: newItemPriority,\n        iconId: newItemIcon\n      \}\);/g,
  `addShoppingItem({
        name: newItemName.trim(),
        checked: false,
        price: 'R$ 0,00',
        numPrice: 0,
        category: newItemCat,
        priority: newItemPriority,
        iconId: newItemIcon
      });`
);

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed TS error 4');
