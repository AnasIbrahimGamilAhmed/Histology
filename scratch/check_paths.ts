import fs from 'fs';
import path from 'path';
import { histologyData } from '../lib/data/histologyData';

function checkPaths() {
  const mismatches: string[] = [];
  
  function traverse(node: any) {
    if (node.imageUrl) {
      const fullPath = path.join(process.cwd(), 'public', node.imageUrl);
      if (!fs.existsSync(fullPath)) {
        mismatches.push(`Missing: ${node.imageUrl} (Title: ${node.title})`);
      }
    }
    if (node.imageUrls) {
      node.imageUrls.forEach((url: string) => {
        const fullPath = path.join(process.cwd(), 'public', url);
        if (!fs.existsSync(fullPath)) {
          mismatches.push(`Missing variation: ${url} (Title: ${node.title})`);
        }
      });
    }
    if (node.subSections) {
      node.subSections.forEach(traverse);
    }
  }

  histologyData.forEach(traverse);
  
  if (mismatches.length > 0) {
    console.log("Mismatches found:");
    mismatches.forEach(m => console.log(m));
  } else {
    console.log("All paths verified!");
  }
}

checkPaths();
