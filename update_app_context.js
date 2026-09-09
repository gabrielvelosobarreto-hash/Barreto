const fs = require('fs');

let content = fs.readFileSync('lib/context/AppContext.tsx', 'utf8');

// 1. Add to interface
content = content.replace(
  'bulkUpdateShoppingItemPriority: (ids: number[], priority: PriorityType) => void;',
  `bulkUpdateShoppingItemPriority: (ids: number[], priority: PriorityType) => void;
  shoppingCategories: string[];
  addShoppingCategory: (cat: string) => void;
  updateShoppingCategory: (oldCat: string, newCat: string) => void;
  deleteShoppingCategory: (cat: string) => void;`
);

// 2. Add state inside AppProvider
const stateInjection = `
  const [shoppingCategories, setShoppingCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCategories = localStorage.getItem('barreto-shopping-categories');
        if (savedCategories) {
          const parsed = JSON.parse(savedCategories);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return ['Alimentos', 'Limpeza', 'Higiene', 'Eletrônicos', 'Sem categoria'];
  });
`;
content = content.replace(
  "return INITIAL_SECTORS;\n  });",
  "return INITIAL_SECTORS;\n  });\n" + stateInjection
);

// 3. Add useEffect
const useEffectInjection = `
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-shopping-categories', JSON.stringify(shoppingCategories));
    } catch {}
  }, [shoppingCategories]);
`;
content = content.replace(
  "localStorage.setItem('barreto-priority-items', JSON.stringify(priorityItems));\n    } catch {}\n  }, [priorityItems]);",
  "localStorage.setItem('barreto-priority-items', JSON.stringify(priorityItems));\n    } catch {}\n  }, [priorityItems]);\n" + useEffectInjection
);

// 4. Add methods
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
  "// ---------- Priority Actions ----------",
  methodsInjection + "\n  // ---------- Priority Actions ----------"
);

// 5. Export variables
content = content.replace(
  "bulkUpdateShoppingItemPriority,",
  "bulkUpdateShoppingItemPriority,\n      shoppingCategories,\n      addShoppingCategory,\n      updateShoppingCategory,\n      deleteShoppingCategory,"
);

fs.writeFileSync('lib/context/AppContext.tsx', content);
