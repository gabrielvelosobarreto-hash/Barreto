const fs = require('fs');
let data = fs.readFileSync('components/views/PrioritiesView.tsx', 'utf8');

data = data.replace(
  /<div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">\s*<Image\s*src=\{item\.img\}\s*alt=\{item\.name\}\s*width=\{48\}\s*height=\{48\}\s*className="h-full w-full object-cover"\s*referrerPolicy="no-referrer"\s*\/>\s*<\/div>/g,
  ''
);

data = data.replace(
  /<div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">\s*<Image\s*src=\{item\.img\}\s*alt=\{item\.name\}\s*width=\{64\}\s*height=\{64\}\s*className="h-full w-full object-cover"\s*referrerPolicy="no-referrer"\s*\/>\s*<\/div>/g,
  ''
);

fs.writeFileSync('components/views/PrioritiesView.tsx', data);
