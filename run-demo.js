const fs=require('node:fs');
const evaluate=require('./src/policy');
const rows=require('./data/demo.json').map(x=>({case:x.case,...evaluate(x.invoice,x.po,x.duplicate,x.prior)}));
const result={environment:'LOCAL NODE SIMULATION — not ServiceNow execution', rows,
  usd_held_cents:rows.reduce((a,x)=>a+x.hold_cents,0),
  interpretation:'Synthetic invoice exposure on hold, not realized savings. No payments executed.'};
fs.mkdirSync('evidence',{recursive:true});
fs.writeFileSync('evidence/local-results.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
