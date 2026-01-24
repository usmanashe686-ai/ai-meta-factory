import * as ns from 'next-seo';
console.log('All exports:', Object.keys(ns));

// Check if NextSeo exists in the module
if (ns.NextSeo) {
  console.log('NextSeo found as property');
} else if (ns.default && ns.default.NextSeo) {
  console.log('NextSeo found in default export');
} else {
  console.log('NextSeo not found');
}
