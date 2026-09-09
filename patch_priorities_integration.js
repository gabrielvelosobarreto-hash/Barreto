const fs = require('fs');
const file = 'components/views/PrioritiesView.tsx';
let data = fs.readFileSync(file, 'utf8');

// 1. Fix handleAdd
data = data.replace(
  /const handleAdd = \(\) => \{([\s\S]*?)setIsModalOpen\(false\);/g,
  `const handleAdd = () => {
    if (!newItemName.trim() || !newItemCategory) {
      setNameError(true);
      return;
    }
    setNameError(false);
    
    const numPrice = parseFloat(newItemPrice.replace(/[^\\d.,]/g, '').replace(',', '.')) || 0;
    const priceStr = numPrice > 0 ? \`R$ \${numPrice.toFixed(2).replace('.', ',')}\` : 'R$ 0,00';
    
    setSectorItemsMap(prev => {
      const sectorId = Number(newItemCategory);
      const items = prev[sectorId] || [];
      return {
        ...prev,
        [sectorId]: [...items, {
          id: Date.now(),
          name: newItemName.trim(),
          desc: '',
          price: priceStr,
          date: new Date().toLocaleDateString('pt-BR'),
          priority: newItemPriority
        }]
      };
    });

    setIsModalOpen(false);`
);

// 2. Fix the category input in the modal to be a sector select
data = data.replace(
  /<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Categoria \/ Setor<\/label>[\s\S]*?placeholder="Ex: Cozinha, Limpeza, Eletrônicos"[\s\S]*?\/>/,
  `<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Setor</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-slate-100"
                >
                  <option value="" disabled>Selecione um Setor</option>
                  {sectors.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>`
);

// 3. Remove quantities from UI
data = data.replace(/<button[^>]*updatePriorityItemQty[^>]*>[\s\S]*?<\/button>\s*<span[^>]*>\{item\.qty\}<\/span>\s*<button[^>]*updatePriorityItemQty[^>]*>[\s\S]*?<\/button>/g, '');

// 4. Update the "Excluir" button handler in PrioritiesView
data = data.replace(/onClick=\{\(\) => removePriorityItem\(item\.id\)\}/g, 'onClick={() => {\n                      setSectorItemsMap(prev => {\n                        const next = { ...prev };\n                        if (next[item.sectorId]) {\n                          next[item.sectorId] = next[item.sectorId].filter(i => i.id !== item.id);\n                        }\n                        return next;\n                      });\n                    }}');

// 5. Update priority level changes (updatePriorityItemLevel)
data = data.replace(/onClick=\{\(\) => updatePriorityItemLevel\(item\.id, p\)\}/g, 'onClick={() => {\n                                    setSectorItemsMap(prev => {\n                                      const next = { ...prev };\n                                      if (next[item.sectorId]) {\n                                        next[item.sectorId] = next[item.sectorId].map(i => i.id === item.id ? { ...i, priority: p } : i);\n                                      }\n                                      return next;\n                                    });\n                                    setOpenPriorityMenuId(null);\n                                  }}');

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed PrioritiesView complete integration');
