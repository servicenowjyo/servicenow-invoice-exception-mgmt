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