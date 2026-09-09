const fs = require('fs');
const file = 'components/views/PrioritiesView.tsx';
let data = fs.readFileSync(file, 'utf8');

// Use sectorItemsMap and sectors
if (!data.includes('sectorItemsMap')) {
  data = data.replace(
    /priorityStats\s*} = useApp\(\);/,
    `priorityStats,\n    sectors,\n    sectorItemsMap,\n    setSectorItemsMap\n  } = useApp();`
  );
}

// Replace the priorityItems with derived ones
if (!data.includes('const derivedPriorityItems = useMemo')) {
  data = data.replace(
    /const \[searchQuery, setSearchQuery\] = useState\(''\);/,
    `const [searchQuery, setSearchQuery] = useState('');
  
  const derivedPriorityItems = useMemo(() => {
    const items = [];
    sectors.forEach(sec => {
      const secItems = sectorItemsMap[sec.id] || [];
      secItems.forEach(si => {
        items.push({
          ...si,
          sectorId: sec.id,
          sectorName: sec.name,
          numPrice: parseFloat(String(si.price).replace(/[^\\d.,]/g, '').replace(',', '.')) || 0,
          qty: 1
        });
      });
    });
    return items;
  }, [sectors, sectorItemsMap]);
  
  // Add edit modal state
  const [editingSectorItem, setEditingSectorItem] = useState(null);
  const [editingItemSectorId, setEditingItemSectorId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editPriority, setEditPriority] = useState('Média');

  const openEditModal = (item) => {
    setEditingSectorItem(item.id);
    setEditingItemSectorId(item.sectorId);
    setEditName(item.name);
    setEditDesc(item.desc);
    setEditPrice(item.price);
    setEditPriority(item.priority || 'Média');
  };

  const saveEdit = () => {
    if (!editName.trim() || !editingItemSectorId) return;
    setSectorItemsMap(prev => {
      const sectorItems = prev[editingItemSectorId] || [];
      return {
        ...prev,
        [editingItemSectorId]: sectorItems.map(i => i.id === editingSectorItem ? {
          ...i, name: editName, desc: editDesc, price: editPrice, priority: editPriority
        } : i)
      };
    });
    setEditingSectorItem(null);
    setEditingItemSectorId(null);
  };
`
  );
}

// Now replace all references to `priorityItems` with `derivedPriorityItems`
// in the search/filter logic
data = data.replace(/priorityItems\.filter/g, 'derivedPriorityItems.filter');
data = data.replace(/const totalItems = priorityItems.length;/g, 'const totalItems = derivedPriorityItems.length;');

fs.writeFileSync(file, data, 'utf8');
console.log('PrioritiesView patched with derived logic!');
