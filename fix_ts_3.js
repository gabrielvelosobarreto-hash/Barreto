const fs = require('fs');
const file = 'components/views/PrioritiesView.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /priorityOrder\[a\.priority\]/g, 
  'priorityOrder[a.priority as PriorityType]'
);
data = data.replace(
  /priorityOrder\[b\.priority\]/g, 
  'priorityOrder[b.priority as PriorityType]'
);

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed TS error 3');
