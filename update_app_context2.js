const fs = require('fs');

let content = fs.readFileSync('lib/context/AppContext.tsx', 'utf8');

const methodsInjection = `
  const addShoppingCategory = (cat: string) => {
    if (!shoppingCategories.includes(cat)) {
      setShoppingCategories(prev => [...prev, cat]);
    }
  };

  const updateShoppingCategory = (oldCat: string, newCat: string) => {
    setShoppingCategories(prev => prev.map(c => c === oldCat ? newCat : c));
  };

  const deleteShoppingCategory = (cat: string) => {
    setShoppingCategories(prev => prev.filter(c => c !== cat));
  };
`;

content = content.replace(
  "  const addPriorityItem = (item: Omit<PriorityItem, 'id'>) => {",
  methodsInjection + "\n  const addPriorityItem = (item: Omit<PriorityItem, 'id'>) => {"
);

fs.writeFileSync('lib/context/AppContext.tsx', content);
