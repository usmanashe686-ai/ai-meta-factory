// Try to import as default and see what we get
import ns from 'next-seo';
console.log('Default export type:', typeof ns);
if (ns && typeof ns === 'object') {
  console.log('All keys in default export:');
  console.log(Object.keys(ns).sort());
  
  // Check if any key contains "NextSeo" or "nextseo"
  const lowerKeys = Object.keys(ns).map(k => k.toLowerCase());
  if (lowerKeys.includes('nextseo')) {
    const actualKey = Object.keys(ns).find(k => k.toLowerCase() === 'nextseo');
    console.log(`Found NextSeo as: ${actualKey}`);
  }
}
