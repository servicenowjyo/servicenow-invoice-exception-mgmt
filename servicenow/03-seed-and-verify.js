// PDI ONLY. Idempotent creation of four synthetic cases, verifies persisted classifier results.
(function(){
 var fixtures=[{"case": "Matched invoice", "invoice": {"supplier": "SYNTH-S001", "invoice": "INV-001", "qty": 10, "unit_cents": 10000, "currency": "USD"}, "po": {"supplier": "SYNTH-S001", "qty": 10, "received": 10, "unit_cents": 10000, "currency": "USD"}, "po_key": "PO-SYNTH-001", "expected": "MATCHED"}, {"case": "Price mismatch", "invoice": {"supplier": "SYNTH-S002", "invoice": "INV-002", "qty": 10, "unit_cents": 11000, "currency": "USD"}, "po": {"supplier": "SYNTH-S002", "qty": 10, "received": 10, "unit_cents": 10000, "currency": "USD"}, "po_key": "PO-SYNTH-002", "expected": "HOLD"}, {"case": "Duplicate invoice", "invoice": {"supplier": "SYNTH-S001", "invoice": "INV-001", "qty": 10, "unit_cents": 10000, "currency": "USD"}, "po": {"supplier": "SYNTH-S001", "qty": 10, "received": 10, "unit_cents": 10000, "currency": "USD"}, "po_key": "PO-SYNTH-001", "expected": "HOLD"}, {"case": "Receipt shortfall", "invoice": {"supplier": "SYNTH-S003", "invoice": "INV-003", "qty": 10, "unit_cents": 20000, "currency": "USD"}, "po": {"supplier": "SYNTH-S003", "qty": 10, "received": 8, "unit_cents": 20000, "currency": "USD"}, "po_key": "PO-SYNTH-003", "expected": "HOLD"}];
 var total=0,passed=0;
 for(var k=0;k<fixtures.length;k++){
  var x=fixtures[k],g=new GlideRecord('u_fin_invoice_case');g.addQuery('correlation_id','FINDEMO-V1-'+k);g.query();
  if(!g.next()) {g.initialize();g.short_description='[FINDEMO] '+x['case'];g.correlation_id='FINDEMO-V1-'+k;
   g.u_payload=JSON.stringify(x);var id=g.insert();if(!id)throw 'Insert failed '+x['case'];g.get(id);}
  var ok=g.getValue('u_result')===x.expected;if(ok)passed++;
  total+=Number(g.getValue('u_held_cents') || 0);
  gs.print((ok?'PASS':'FAIL')+' | '+g.getValue('number')+' | '+x['case']+' | '+g.getValue('u_result')+' | '+g.getValue('u_reasons')+' | held USD cents='+g.getValue('u_held_cents'));
 }
 gs.print('PLATFORM FIXTURE CHECKS: '+passed+'/4. USD HELD EXPOSURE: '+(total/100).toFixed(2));
 if(passed!==4 || total!==410000)throw 'Verification failed';
 gs.print('DEMO VERIFIED. Synthetic exposure, not financial savings. No payment execution.');
})();
