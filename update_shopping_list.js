const fs = require('fs');

let content = fs.readFileSync('components/views/ShoppingListView.tsx', 'utf8');

// Remove CATEGORIES constant
content = content.replace(
  "const CATEGORIES = ['Todos', 'Alimentos', 'Limpeza', 'Higiene', 'Eletrônicos'];",
  ""
);

// Add context destructuring
content = content.replace(
  "    shoppingStats \n  } = useApp();",
  `    shoppingStats,
    shoppingCategories,
    addShoppingCategory,
    updateShoppingCategory,
    deleteShoppingCategory
  } = useApp();`
);

// We need an array for chips that includes 'Todos'
content = content.replace(
  "        {CATEGORIES.map((chip) => {",
  "        {['Todos', ...shoppingCategories].map((chip) => {"
);

// In the add item modal
content = content.replace(
  "{CATEGORIES.filter(c => c !== 'Todos').map(c => (",
  "{shoppingCategories.map(c => ("
);

// Update Priority labels
content = content.replace('<option value="Alta">Alta Prioridade</option>', '<option value="Alta">Alta</option>');
content = content.replace('<option value="Média">Média Prioridade</option>', '<option value="Média">Média</option>');
content = content.replace('<option value="Baixa">Baixa Prioridade</option>', '<option value="Baixa">Baixa</option>');

// Add Settings button to Categories
content = content.replace(
  "      <div className=\"flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1\">",
  `      <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1">
        <button 
          onClick={() => setIsCategoryModalOpen(true)}
          className="flex-shrink-0 flex items-center justify-center px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>`
);

// Add Modal State
content = content.replace(
  "  const [isModalOpen, setIsModalOpen] = useState(false);",
  "  const [isModalOpen, setIsModalOpen] = useState(false);\n  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);\n  const [catEditId, setCatEditId] = useState<string | null>(null);\n  const [catEditName, setCatEditName] = useState('');\n  const [newCatName, setNewCatName] = useState('');"
);

// Add Category Modal Component
const categoryModalHtml = `
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Gerenciar Categorias</h3>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nova categoria..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                />
                <button
                  onClick={() => {
                    if (newCatName.trim()) {
                      addShoppingCategory(newCatName.trim());
                      setNewCatName('');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Adicionar
                </button>
              </div>

              <div className="space-y-2 mt-4">
                {shoppingCategories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    {catEditId === cat ? (
                      <div className="flex flex-1 gap-2 mr-2">
                        <input
                          type="text"
                          value={catEditName}
                          onChange={e => setCatEditName(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                        />
                        <button
                          onClick={() => {
                            if (catEditName.trim() && catEditName !== cat) {
                              updateShoppingCategory(cat, catEditName.trim());
                            }
                            setCatEditId(null);
                          }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCatEditId(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setCatEditId(cat);
                              setCatEditName(cat);
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteShoppingCategory(cat)}
                            disabled={cat === 'Sem categoria'}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-6 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 rounded-xl transition-all shadow-sm"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  "{/* Modal de Alteração de Prioridade em Lote */}",
  categoryModalHtml + "\n      {/* Modal de Alteração de Prioridade em Lote */}"
);

fs.writeFileSync('components/views/ShoppingListView.tsx', content);
