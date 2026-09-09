const fs = require('fs');
let data = fs.readFileSync('components/views/SectorsView.tsx', 'utf8');

// Update item div to include ID
data = data.replace(
  /className=\{\`rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 transition-all relative border \$\{openItemMenuId === item\.id \|\| openPriorityMenuId === item\.id \? 'z-50' : 'z-0'\} \$\{/g,
  `id={\`item-\${item.id}\`}
                          className={\`rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 transition-all relative border \${openItemMenuId === item.id || openPriorityMenuId === item.id ? 'z-50' : 'z-0'} \${`
);

// Add highlighted state class conditionally based on state. Wait, we can just use scrollIntoView and simple outline.
data = data.replace(
  /if \(targetItemId\) \{\n          \/\/ Let's highlight the item if needed, but for now just opening the sector is fine\n          \/\/ We can scroll to the item by finding it in the DOM, or just keep it simple\n        \}/g,
  `if (targetItemId) {
          setTimeout(() => {
            const el = document.getElementById(\`item-\${targetItemId}\`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Small visual cue (could add a flash class but border ring is enough)
            }
          }, 400); // give the modal time to render
        }`
);

fs.writeFileSync('components/views/SectorsView.tsx', data);
