const fs = require('fs');
const file = 'components/views/MaintenanceView.tsx';
let data = fs.readFileSync(file, 'utf8');

// 1. Saúde Preventiva
data = data.replace(
  /<div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">\s*<div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">\s*<span>Saúde Preventiva<\/span>/g,
  `<div 
          onClick={() => { setMacroTab('lista'); setSelectedType('Preventiva'); setSelectedStatus('Todos'); setSelectedPriority('Todas'); }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer group active:scale-95"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 group-hover:text-emerald-500 transition-colors">
            <span>Saúde Preventiva</span>`
);

// 2. Pendências Críticas (Urgências e Pendências)
data = data.replace(
  /<div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">\s*<div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">\s*<span>Pendências Críticas<\/span>/g,
  `<div 
          onClick={() => { setMacroTab('lista'); setSelectedPriority('Crítica'); setSelectedStatus('Pendente'); setSelectedType('Todos'); }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-rose-500 transition-all cursor-pointer group active:scale-95"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 group-hover:text-rose-500 transition-colors">
            <span>Pendências Críticas</span>`
);

// 3. Peças & Subgrupos (Itens a Comprar / Peças dos Subgrupos)
data = data.replace(
  /<div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">\s*<div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">\s*<span>Peças & Subgrupos<\/span>/g,
  `<div 
          onClick={() => { setMacroTab('compras'); }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-500 transition-all cursor-pointer group active:scale-95"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 group-hover:text-amber-500 transition-colors">
            <span>Peças & Subgrupos</span>`
);

// 4. Orçamento Estimado
data = data.replace(
  /<div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">\s*<div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">\s*<span>Orçamento Estimado<\/span>/g,
  `<div 
          onClick={() => { if (showGlobalExpenses) setMacroTab('gastos'); }}
          className={\`bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-all \${showGlobalExpenses ? 'hover:shadow-md hover:border-blue-500 cursor-pointer active:scale-95 group' : ''}\`}
        >
          <div className={\`flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 \${showGlobalExpenses ? 'group-hover:text-blue-500 transition-colors' : ''}\`}>
            <span>Orçamento Estimado</span>`
);

fs.writeFileSync(file, data, 'utf8');
console.log('Maintenance cards patched!');
