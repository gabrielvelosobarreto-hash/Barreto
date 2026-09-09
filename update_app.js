const fs = require('fs');
let data = fs.readFileSync('app/page.tsx', 'utf8');

data = data.replace(
  /const \[maintenanceMacroTab, setMaintenanceMacroTab\] = useState<MaintenanceMacroTab>\('lista'\);/,
  `const [maintenanceMacroTab, setMaintenanceMacroTab] = useState<MaintenanceMacroTab>('lista');
  const [targetSectorId, setTargetSectorId] = useState<number | null>(null);
  const [targetItemId, setTargetItemId] = useState<number | null>(null);`
);

data = data.replace(
  /const handleNavigate = \(tab: TabType, priority\?: PriorityFilterType, mTab\?: MaintenanceMacroTab\) => \{/,
  `const handleNavigate = (tab: TabType, priority?: PriorityFilterType, mTab?: MaintenanceMacroTab, sectorId?: number | null, itemId?: number | null) => {`
);

data = data.replace(
  /if \(mTab\) \{\n      setMaintenanceMacroTab\(mTab\);\n    \}/,
  `if (mTab) {
      setMaintenanceMacroTab(mTab);
    }
    if (sectorId !== undefined) {
      setTargetSectorId(sectorId);
    }
    if (itemId !== undefined) {
      setTargetItemId(itemId);
    }`
);

data = data.replace(
  /\{activeTab === 'setores' && <SectorsView \/>\}/,
  `{activeTab === 'setores' && (
              <SectorsView 
                targetSectorId={targetSectorId} 
                targetItemId={targetItemId} 
                onTargetHandled={() => {
                  setTargetSectorId(null);
                  setTargetItemId(null);
                }} 
              />
            )}`
);

data = data.replace(
  /<PrioritiesView \n                initialPriority=\{selectedPriority\} \n                onPriorityChange=\{setSelectedPriority\} \n              \/>/,
  `<PrioritiesView 
                initialPriority={selectedPriority} 
                onPriorityChange={setSelectedPriority}
                onNavigate={handleNavigate}
              />`
);

fs.writeFileSync('app/page.tsx', data);
