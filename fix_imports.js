const fs = require('fs');
let data = fs.readFileSync('components/views/PrioritiesView.tsx', 'utf8');

data = data.replace(
  /import type \{ PriorityFilterType \} from '@\/app\/page';/,
  `import type { PriorityFilterType, TabType, MaintenanceMacroTab } from '@/app/page';`
);

fs.writeFileSync('components/views/PrioritiesView.tsx', data);
