const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client/src');

const map = {
  // Backgrounds
  'bg-dark-950': 'bg-page',
  'bg-dark-900': 'bg-surface',
  'bg-dark-800': 'bg-surface-hover',
  'bg-dark-800/80': 'bg-surface-hover',
  'bg-dark-800/50': 'bg-surface-hover',
  
  // Borders
  'border-dark-700/50': 'border-border',
  'border-dark-700': 'border-border',
  'border-dark-600/50': 'border-divider',
  'border-dark-600': 'border-border',
  'bg-dark-700': 'bg-border', // Some progress bars

  // Text
  'text-white': 'text-primary',
  'text-dark-100': 'text-primary',
  'text-dark-200': 'text-secondary',
  'text-dark-300': 'text-tertiary',
  'text-dark-400': 'text-muted',
  'text-dark-500': 'text-muted opacity-50',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Use simple regex replacement for boundaries
      for (const [oldClass, newClass] of Object.entries(map)) {
        // We match exact class name strings
        const regex = new RegExp(`\\b${oldClass.replace('/', '\\/')}\\b`, 'g');
        content = content.replace(regex, newClass);
      }

      fs.writeFileSync(fullPath, content);
    }
  }
}

processDirectory(srcDir);
console.log('Refactor complete!');
