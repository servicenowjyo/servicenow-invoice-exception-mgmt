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

(function(){
 var c=new GlideRecord('u_fin_invoice_case');c.addQuery('correlation_id','FINDEMO-AUTOMATION-TEST');c.query();
 if(!c.next()) {c.initialize();c.correlation_id='FINDEMO-AUTOMATION-TEST';c.short_description='[FINDEMO-TEST] Automatic review';
 c.u_payload=JSON.stringify({po_key:'PO-SYNTH-AUTO',invoice:{supplier:'SYNTH-AUTO',invoice:'AUTO-001',qty:1,unit_cents:11000,currency:'USD'},
 po:{supplier:'SYNTH-AUTO',qty:1,received:1,unit_cents:10000,currency:'USD'}});var id=c.insert();if(!id)throw 'Auto case insert failed';c.get(id);}
 var a=new GlideRecord('sysapproval_approver');a.addQuery('sysapproval',c.getUniqueValue());a.query();var count=0;while(a.next()){if(a.state=='requested')count++;}
 if(c.u_result!='HOLD' || c.approval!='requested' || count!==1)throw 'Automatic review test failed';
 gs.print('PASS AUTOMATIC REVIEW | '+c.number+' | HOLD | exactly one requested approval');
 var bad=new GlideRecord('u_fin_invoice_case');bad.initialize();bad.short_description='[FINDEMO-TEST] Invalid rejected';bad.u_payload=JSON.stringify({invoice:{supplier:'SYNTH-BAD',invoice:'BAD-001',qty:0,unit_cents:100,currency:'USD'}});
 if(bad.insert())throw 'Invalid record was incorrectly saved';
 gs.print('PASS INVALID INPUT | zero quantity rejected before database insert');
 var rows=new GlideRecord('u_fin_invoice_case');rows.addQuery('correlation_id','STARTSWITH','FINDEMO-V1-');rows.query();var held=0,n=0;
 while(rows.next()){held+=Number(rows.u_held_cents);n++;}
 if(n!==4 || held!==410000)throw 'Core demo totals changed';
 gs.print('PASS CORE TOTALS | four portfolio cases | USD 4100.00 held synthetic exposure');
})();
(function(){
 var g=new GlideRecord('u_fin_invoice_case');g.get('correlation_id','FINDEMO-V1-0');
 var old=String(g.u_payload);g.u_payload=old+' ';var id=g.update();
 if(id)throw 'Submitted payload incorrectly editable';
 g.get('correlation_id','FINDEMO-V1-0');if(String(g.u_payload)!==old)throw 'Payload was modified';
 gs.print('PASS IMMUTABLE INTAKE | original submitted snapshot preserved');
})();
