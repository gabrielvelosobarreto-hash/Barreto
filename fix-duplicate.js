const fs = require('fs');

let content = fs.readFileSync('lib/context/AppContext.tsx', 'utf8');

const duplicateString = `  shoppingCategories: string[];
  addShoppingCategory: (cat: string) => void;
  updateShoppingCategory: (oldCat: string, newCat: string) => void;
  deleteShoppingCategory: (cat: string) => void;
  
  shoppingCategories: string[];
  addShoppingCategory: (cat: string) => void;
  updateShoppingCategory: (oldCat: string, newCat: string) => void;
  deleteShoppingCategory: (cat: string) => void;`;

const correctString = `  shoppingCategories: string[];
  addShoppingCategory: (cat: string) => void;
  updateShoppingCategory: (oldCat: string, newCat: string) => void;
  deleteShoppingCategory: (cat: string) => void;`;

content = content.replace(duplicateString, correctString);
fs.writeFileSync('lib/context/AppContext.tsx', content);
