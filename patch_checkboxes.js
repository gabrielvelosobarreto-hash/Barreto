const fs = require('fs');
const file = 'components/views/ShoppingListView.tsx';
let data = fs.readFileSync(file, 'utf8');

// Update Selection Checkbox (make it blue and square)
data = data.replace(
  /'bg-emerald-600 border-emerald-600 text-white'/g,
  `'bg-indigo-600 border-indigo-600 text-white shadow-sm'`
);
data = data.replace(
  /'border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-slate-800'/g,
  `'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800 shadow-sm'`
);

// Update Purchased Checkbox (make it emerald and rounded-full)
data = data.replace(
  /className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-400"/g,
  `className="peer h-6 w-6 cursor-pointer appearance-none rounded-full border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-400 shadow-sm"`
);

fs.writeFileSync(file, data, 'utf8');
console.log('ShoppingListView checkboxes patched');
