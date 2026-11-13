// Create review approvals for HOLD demo cases; no notification recipients are added.
// Reviewer is the current PDI administrator for demonstration, not segregation-of-duties proof.
(function(){
 var g=new GlideRecord('u_fin_invoice_case');g.addQuery('correlation_id','STARTSWITH','FINDEMO-V1-');g.addQuery('u_result','HOLD');g.query();var n=0;
 while(g.next()){
  var a=new GlideRecord('sysapproval_approver');a.addQuery('sysapproval',g.getUniqueValue());a.addQuery('approver',gs.getUserID());a.query();
  if(!a.next()){a.initialize();a.sysapproval=g.getUniqueValue();a.approver=gs.getUserID();a.state='requested';a.setWorkflow(false);if(!a.insert())throw 'Approval creation failed';}
  g.approval='requested';g.update();n++;gs.print('REVIEW REQUESTED | '+g.getValue('number')+' | '+g.getValue('short_description'));
 }
 gs.print('Cases with requested demo review: '+n+'. No payment authorized.');
})();
