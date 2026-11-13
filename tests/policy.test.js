const assert = require('node:assert/strict');
const evaluate = require('../src/policy');
const i={supplier:'SYNTH-S001',invoice:'INV-001',qty:10,unit_cents:10000,currency:'USD'};
const p={supplier:'SYNTH-S001',qty:10,received:10,unit_cents:10000,currency:'USD'};
let passed=0;
function test(name, fn){fn();passed++;console.log('PASS '+name);}
test('exact match has no held amount',()=>assert.deepEqual(evaluate(i,p,false,false),{status:'MATCHED',reasons:[],hold_cents:0}));
test('one cent price difference holds entire invoice',()=>assert.equal(evaluate({...i,unit_cents:10001},p,false,false).hold_cents,100010));
test('duplicate with price mismatch counted once',()=>assert.equal(evaluate({...i,unit_cents:11000},p,true,false).hold_cents,110000));
test('missing PO',()=>assert.deepEqual(evaluate(i,null,false,false).reasons,['MISSING_PO']));
test('receipt boundary equal is accepted',()=>assert.equal(evaluate({...i,qty:8},{...p,received:8},false,false).status,'MATCHED'));
test('one unit above receipt held',()=>assert.ok(evaluate(i,{...p,received:9},false,false).reasons.includes('RECEIPT_SHORTFALL')));
test('over ordered flagged',()=>assert.ok(evaluate({...i,qty:11},p,false,false).reasons.includes('OVER_ORDERED')));
test('zero quantity invalid',()=>assert.equal(evaluate({...i,qty:0},p,false,false).status,'INVALID'));
test('fractional cents invalid',()=>assert.equal(evaluate({...i,unit_cents:1.5},p,false,false).status,'INVALID'));
test('negative received quantity held',()=>assert.ok(evaluate(i,{...p,received:-1},false,false).reasons.includes('INVALID_PO')));
test('different supplier held',()=>assert.ok(evaluate(i,{...p,supplier:'SYNTH-S002'},false,false).reasons.includes('SUPPLIER_MISMATCH')));
test('unsupported FX excluded from USD sum',()=>assert.equal(evaluate({...i,currency:'EUR'},p,false,false).hold_cents,0));
test('second invoice against PO needs manual cumulative review',()=>assert.ok(evaluate(i,p,false,true).reasons.includes('SPLIT_BILLING_REVIEW')));
test('numeric string rejected rather than coerced',()=>assert.equal(evaluate({...i,qty:'10'},p,false,false).status,'INVALID'));
test('platform integer overflow rejected',()=>assert.equal(evaluate({...i,qty:1000000000},p,false,false).status,'INVALID'));
console.log(passed+' tests passed; local Node policy tests only.');

