import { computeFireResult } from '../src/lib/fire/calculations';
import {
  DEFAULT_PARAMETERS,
  DEFAULT_ASSET_ALLOCATION,
  DEFAULT_EXPENSES,
} from '../src/lib/fire/defaults';

const result = computeFireResult(
  DEFAULT_PARAMETERS,
  DEFAULT_ASSET_ALLOCATION,
  DEFAULT_EXPENSES,
);

// Add to scripts/test-math.ts
const crossingPoint = result.projection.find(p => p.corpus >= p.fireTarget);
console.log('\nCorpus first crosses FIRE target at:', crossingPoint);

const at38 = result.projection.find(p => p.age === 38);
console.log('At age 38:', at38);

const at50 = result.projection.find(p => p.age === 50);
console.log('At age 50:', at50);

console.log('FIRE Number:', (result.fireNumber / 1e7).toFixed(2), 'Cr');
console.log('Years to FIRE:', result.yearsToFire);
console.log('Retire at age:', result.retireAtAge);
console.log('Total monthly expenses:', result.totalMonthlyExpenses);
console.log('Weighted return:', result.weightedReturn.toFixed(2), '%');
console.log('Avg inflation:', result.avgInflation.toFixed(2), '%');
console.log('Status:', result.status);
console.log('Message:', result.statusMessage);
console.log('First 5 projection points:', result.projection.slice(0, 5));
console.log('Projection length:', result.projection.length);
