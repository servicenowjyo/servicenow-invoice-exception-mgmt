(function executeRule(current, previous){
 if(current.getValue('u_result')!=='HOLD')return;
 var a=new GlideRecord('sysapproval_approver');a.initialize();
 a.sysapproval=current.getUniqueValue();a.approver=gs.getUserID();a.state='requested';
 a.setWorkflow(false); // PDI demonstration only: suppress notifications, no external recipient.
 if(!a.insert())gs.error('Finance demo review creation failed for '+current.getValue('number'));
})(current, previous);