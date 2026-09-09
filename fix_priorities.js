const fs = require('fs');
const file = 'components/views/PrioritiesView.tsx';
let data = fs.readFileSync(file, 'utf8');

// Update derivedPriorityItems
data = data.replace(
  /items\.push\(\{([\s\S]*?)qty: 1\s*\}\);/g,
  `items.push({\n          ...si,\n          sectorId: sec.id,\n          sectorName: sec.name,\n          category: sec.name,\n          img: FILTER_IMG,\n          numPrice: parseFloat(String(si.price).replace(/[^\\d.,]/g, '').replace(',', '.')) || 0,\n          qty: 1\n        });`
);

// Update let result = [...priorityItems];
data = data.replace(/let result = \[\.\.\.priorityItems\];/g, 'let result = [...derivedPriorityItems];');

// Update dependencies of useMemo
data = data.replace(/\[priorityItems, activeFilter, searchQuery, sortBy\]/g, '[derivedPriorityItems, activeFilter, searchQuery, sortBy]');

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed PrioritiesView integration');
