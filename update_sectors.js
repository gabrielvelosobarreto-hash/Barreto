const fs = require('fs');
let data = fs.readFileSync('components/views/SectorsView.tsx', 'utf8');

data = data.replace(
  /export default function SectorsView\(\) \{/,
  `interface SectorsViewProps {
  targetSectorId?: number | null;
  targetItemId?: number | null;
  onTargetHandled?: () => void;
}

export default function SectorsView({ targetSectorId, targetItemId, onTargetHandled }: SectorsViewProps = {}) {`
);

// We should use an effect to load the details sector if targetSectorId is present
const effectCode = `
  useEffect(() => {
    if (targetSectorId) {
      const sector = sectors.find(s => s.id === targetSectorId);
      if (sector) {
        setDetailsSector(sector);
        if (targetItemId) {
          // Let's highlight the item if needed, but for now just opening the sector is fine
          // We can scroll to the item by finding it in the DOM, or just keep it simple
        }
      }
      if (onTargetHandled) {
        onTargetHandled();
      }
    }
  }, [targetSectorId, targetItemId, sectors, onTargetHandled]);
`;

// Insert the effect after the initial states
data = data.replace(
  /const \[detailsSector, setDetailsSector\] = useState<Sector \| null>\(null\);/,
  `const [detailsSector, setDetailsSector] = useState<Sector | null>(null);
${effectCode}`
);

fs.writeFileSync('components/views/SectorsView.tsx', data);
