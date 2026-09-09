const fs = require('fs');
const file = 'components/views/ShoppingListView.tsx';
let data = fs.readFileSync(file, 'utf8');

// 1. Add editingItemId state
if (!data.includes('const [editingItemId, setEditingItemId] =')) {
  data = data.replace(
    /const \[isBulkPriorityModalOpen, setIsBulkPriorityModalOpen\] = useState\(false\);/,
    `const [isBulkPriorityModalOpen, setIsBulkPriorityModalOpen] = useState(false);\n  const [editingItemId, setEditingItemId] = useState<number | null>(null);`
  );
}

// 2. Destructure editShoppingItem
if (!data.includes('editShoppingItem,')) {
  data = data.replace(
    /addShoppingItem,/,
    `addShoppingItem,\n    editShoppingItem,`
  );
}

// 3. Update handleAdd to handle edit
if (data.includes('const handleAdd = () => {') && !data.includes('editShoppingItem(editingItemId')) {
  data = data.replace(
    /const handleAdd = \(\) => {([\s\S]*?)addShoppingItem\(\{([\s\S]*?)\}\);([\s\S]*?)setIsModalOpen\(false\);([\s\S]*?)\};/,
    `const handleAdd = () => {
    if (!newItemName.trim()) return;
    
    if (editingItemId) {
      editShoppingItem(editingItemId, {
        name: newItemName.trim(),
        quantity: newItemQuantity,
        categoryId: newItemCategory,
        priority: newItemPriority,
        iconId: newItemIcon
      });
      showToast('Item atualizado com sucesso!');
    } else {
      addShoppingItem({
        name: newItemName.trim(),
        checked: false,
        quantity: newItemQuantity,
        categoryId: newItemCategory,
        priority: newItemPriority,
        iconId: newItemIcon
      });
      showToast('Item adicionado à lista!');
    }
    
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemCategory('none');
    setNewItemPriority('Média');
    setEditingItemId(null);
    setIsModalOpen(false);
  };`
  );
}

// 4. Update the add button to open modal in add mode explicitly
data = data.replace(
  /<button\s+onClick=\{\(\) => setIsModalOpen\(true\)\}/g,
  `<button onClick={() => { setEditingItemId(null); setNewItemName(''); setNewItemQuantity(1); setNewItemCategory('none'); setNewItemPriority('Média'); setIsModalOpen(true); }}`
);

// 5. Add "Editar" button to dropdown
if (!data.includes('Editar Item</button>')) {
  data = data.replace(
    /Excluir da Lista\s*<\/button>/,
    `Excluir da Lista
                        </button>
                        <button
                          onClick={() => {
                            setEditingItemId(item.id);
                            setNewItemName(item.name);
                            setNewItemQuantity(item.quantity || 1);
                            setNewItemCategory(item.categoryId || 'none');
                            setNewItemPriority(item.priority || 'Média');
                            setNewItemIcon(item.iconId || 'shopping-cart');
                            setIsModalOpen(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          Editar Item</button>`
  );
}

// 6. Update the Modal title if editing
if (!data.includes('editingItemId ?')) {
  data = data.replace(
    /Adicionar Novo Item/g,
    `{editingItemId ? 'Editar Item' : 'Adicionar Novo Item'}`
  );
  data = data.replace(
    /Adicionar à Lista/g,
    `{editingItemId ? 'Salvar Alterações' : 'Adicionar à Lista'}`
  );
}

fs.writeFileSync(file, data, 'utf8');
console.log('ShoppingListView patched with edit functionality');
