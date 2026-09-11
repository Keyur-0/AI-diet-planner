import { translations } from '../frontend/src/i18n/translations.js';

const enKeys = [];
const hiKeys = [];
const guKeys = [];

function collectKeys(obj, prefix = '', list) {
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      collectKeys(v, fullKey, list);
    } else {
      list.push(fullKey);
    }
  }
}

collectKeys(translations.en, '', enKeys);
collectKeys(translations.hi, '', hiKeys);
collectKeys(translations.gu, '', guKeys);

console.log(`Total EN keys: ${enKeys.length}`);
console.log(`Total HI keys: ${hiKeys.length}`);
console.log(`Total GU keys: ${guKeys.length}`);

const missingInHi = enKeys.filter(k => !hiKeys.includes(k));
const missingInGu = enKeys.filter(k => !guKeys.includes(k));

console.log('\nKeys missing in HI:', missingInHi);
console.log('Keys missing in GU:', missingInGu);
