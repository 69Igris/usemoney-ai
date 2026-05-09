import { useFireStore, selectFireResult } from '../src/lib/store/fireStore';

const store = useFireStore.getState();

console.log('Initial FIRE Number:',
  (selectFireResult(useFireStore.getState()).fireNumber / 1e7).toFixed(2), 'Cr');

// Mutate via action
store.setMonthlySavings(150000);
console.log('After 2x savings:',
  (selectFireResult(useFireStore.getState()).fireNumber / 1e7).toFixed(2), 'Cr');
console.log('Years to FIRE now:',
  selectFireResult(useFireStore.getState()).yearsToFire);

// Save scenario
const scenarioId = store.saveScenario('Aggressive saver');
console.log('Saved scenario id:', scenarioId);
console.log('Saved scenarios count:', useFireStore.getState().savedScenarios.length);

// Reset
store.resetAll();
console.log('After reset, monthly savings back to:',
  useFireStore.getState().parameters.monthlySavings);
console.log('Saved scenarios still kept:',
  useFireStore.getState().savedScenarios.length);