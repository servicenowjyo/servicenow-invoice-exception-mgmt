var FinanceInvoicePolicy = Class.create();
FinanceInvoicePolicy.prototype = {
 initialize:function(){},
 evaluate:function(i, p, duplicate, priorPoInvoice) {
  function positiveInt(v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v && v > 0 && v <= 1000000000; }
  var reasons = [];
  if (!i || !i.supplier || !i.invoice || !positiveInt(i.qty) || !positiveInt(i.unit_cents) ||
      i.qty * i.unit_cents > 2147483647) {
    return {status:'INVALID', reasons:['INVALID_INPUT'], hold_cents:0};
  }
  if (i.currency !== 'USD') reasons.push('UNSUPPORTED_CURRENCY');
  if (duplicate) reasons.push('DUPLICATE');
  if (!p) reasons.push('MISSING_PO');
  else {
    if (!positiveInt(p.qty) || !positiveInt(p.unit_cents) || typeof p.received !== 'number' ||
        !isFinite(p.received) || Math.floor(p.received) !== p.received || p.received < 0 || p.received > p.qty)
      reasons.push('INVALID_PO');
    else {
      if (i.qty > p.qty) reasons.push('OVER_ORDERED');
      if (i.qty > p.received) reasons.push('RECEIPT_SHORTFALL');
      if (i.unit_cents !== p.unit_cents) reasons.push('PRICE_MISMATCH');
    }
    if (p.supplier !== i.supplier) reasons.push('SUPPLIER_MISMATCH');
    if (p.currency !== i.currency) reasons.push('CURRENCY_MISMATCH');
  }
  if (priorPoInvoice) reasons.push('SPLIT_BILLING_REVIEW');
  return {status: reasons.length ? 'HOLD' : 'MATCHED', reasons:reasons,
    hold_cents: reasons.length && i.currency === 'USD' ? i.qty * i.unit_cents : 0};
},
 type:'FinanceInvoicePolicy'
};
