const fs = require('fs');
const file = 'lib/context/AppContext.tsx';
let data = fs.readFileSync(file, 'utf8');

// Add to AppContextType
if (!data.includes('editShoppingItem: (id: number')) {
  data = data.replace(
    /removeShoppingItem: \(id: number\) => void;/,
    `removeShoppingItem: (id: number) => void;\n  editShoppingItem: (id: number, data: Partial<ShoppingItem>) => void;`
  );
}

// Add to AppProvider implementation
if (!data.includes('const editShoppingItem =')) {
  data = data.replace(
    /const updateShoppingItemPriority =/,
    `const editShoppingItem = (id: number, data: Partial<ShoppingItem>) => {
    setShoppingItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
  };\n\n  const updateShoppingItemPriority =`
  );
}

// Add to Context Provider value
if (!data.includes('editShoppingItem,')) {
  data = data.replace(
    /removeShoppingItem,/,
    `removeShoppingItem,\n      editShoppingItem,`
  );
}

fs.writeFileSync(file, data, 'utf8');
console.log('App context patched with editShoppingItem');
