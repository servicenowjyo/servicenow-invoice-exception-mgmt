(function executeRule(current, previous) {
  if(current.operation()==='update'){if(current.u_payload.changes()){gs.addErrorMessage('Finance demo: submitted payload is immutable; create a replacement case.');current.setAbortAction(true);}return;}
  function norm(v){return String(v || '').replace(/^\s+|\s+$/g,'').toUpperCase();}
  var payload;
  try {payload=JSON.parse(current.getValue('u_payload') || '{}');} catch(e) {
    gs.addErrorMessage('Finance demo: valid JSON payload is required.'); current.setAbortAction(true); return;
  }
  var i=payload.invoice, p=payload.po;
  if (!i) {gs.addErrorMessage('Finance demo: invoice is required.');current.setAbortAction(true);return;}
  i.supplier=norm(i.supplier);i.invoice=norm(i.invoice);
  if (p) p.supplier=norm(p.supplier);
  current.u_supplier=i.supplier; current.u_invoice_key=i.invoice;
  current.u_po_key=norm(payload.po_key);
  var dup=new GlideRecord('u_fin_invoice_case');
  dup.addQuery('u_supplier',i.supplier); dup.addQuery('u_invoice_key',i.invoice);
  dup.addQuery('sys_id','!=',current.getUniqueValue()); dup.setLimit(1); dup.query();
  var prior=false;
  if (current.getValue('u_po_key')) {
    var other=new GlideRecord('u_fin_invoice_case');
    other.addQuery('u_po_key',current.getValue('u_po_key'));
    other.addQuery('sys_id','!=',current.getUniqueValue());other.setLimit(1);other.query();prior=other.hasNext();
  }
  var result=new FinanceInvoicePolicy().evaluate(i,p,dup.hasNext(),prior);
  if (result.status==='INVALID') {gs.addErrorMessage('Finance demo: invalid quantity or price.');current.setAbortAction(true);return;}
  current.u_result=result.status; current.u_reasons=result.reasons.join(', ');
  current.u_amount_cents=i.qty*i.unit_cents; current.u_held_cents=result.hold_cents;
  if (current.operation()==='insert') {
    current.approval=result.status==='HOLD'?'requested':'not requested'; current.state=1;
    current.description='SYNTHETIC TRAINING DATA. '+JSON.stringify(result)+'\nNo payment integration. Review only.';
  }
})(current, previous);
