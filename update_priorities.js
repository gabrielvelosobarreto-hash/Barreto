const fs = require('fs');
let data = fs.readFileSync('components/views/PrioritiesView.tsx', 'utf8');

// 1. Add onNavigate to interface and props
data = data.replace(
  /export interface PrioritiesViewProps \{/,
  `import { TabType, PriorityFilterType, MaintenanceMacroTab } from '@/app/page';

export interface PrioritiesViewProps {`
);

data = data.replace(
  /onPriorityChange\?: \(p: PriorityFilterType\) => void;/,
  `onPriorityChange?: (p: PriorityFilterType) => void;
  onNavigate?: (tab: TabType, priority?: PriorityFilterType, mTab?: MaintenanceMacroTab, sectorId?: number | null, itemId?: number | null) => void;`
);

data = data.replace(
  /export default function PrioritiesView\(\{ \n  initialPriority = 'Todas',\n  onPriorityChange \n\}: PrioritiesViewProps\) \{/,
  `export default function PrioritiesView({ 
  initialPriority = 'Todas',
  onPriorityChange,
  onNavigate
}: PrioritiesViewProps) {`
);

// 2. Add cursor-pointer and onClick to List view item wrapper
data = data.replace(
  /<div className="flex items-center gap-3\.5 min-w-0 flex-1">/g,
  `<div 
    className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
    onClick={() => onNavigate && onNavigate('setores', undefined, undefined, item.sectorId, item.id)}
  >`
);

// 3. Add cursor-pointer and onClick to Grid view item wrapper
// We need to match the specific grid view div.
data = data.replace(
  /key=\{item\.id\} \n                className=\{\`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-xs relative overflow-hidden transition-all hover:shadow-md \$\{/g,
  `key={item.id} 
                onClick={() => onNavigate && onNavigate('setores', undefined, undefined, item.sectorId, item.id)}
                className={\`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-xs relative overflow-hidden transition-all hover:shadow-md cursor-pointer \${`
);

// We should also make sure buttons inside the Grid view call e.stopPropagation()
// The button for priority change:
data = data.replace(
  /onClick=\{\(\) => setOpenPriorityMenuId\(openPriorityMenuId === item\.id \? null : item\.id\)\}/g,
  `onClick={(e) => {
    e.stopPropagation();
    setOpenPriorityMenuId(openPriorityMenuId === item.id ? null : item.id);
  }}`
);

fs.writeFileSync('components/views/PrioritiesView.tsx', data);
