const fs = require('fs');
let data = fs.readFileSync('components/views/ShoppingListView.tsx', 'utf8');

// 1. Add "Gerenciar" button next to Category label
data = data.replace(
  /<div>\s*<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1\.5">Categoria<\/label>/g,
  `<div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Categoria</label>
                    <button 
                      type="button" 
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md transition-colors"
                    >
                      Gerenciar
                    </button>
                  </div>`
);

// 2. Make Category Modal z-[60] so it overlays the Item Modal properly
data = data.replace(
  /\{isCategoryModalOpen && \(\n        <div className="fixed inset-0 z-50/g,
  `{isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60]`
);

fs.writeFileSync('components/views/ShoppingListView.tsx', data);
