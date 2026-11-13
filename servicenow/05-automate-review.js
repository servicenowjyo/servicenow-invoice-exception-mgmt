(function(){
 var b=new GlideRecord('sys_script');b.addQuery('name','Finance Demo - Request Human Review');b.query();var found=b.next();
 if(!found)b.initialize();b.name='Finance Demo - Request Human Review';b.collection='u_fin_invoice_case';b.active=true;
 b.when='after';b.order=100;b.action_insert=true;b.action_update=false;b.advanced=true;b.script="(function executeRule(current, previous){\n if(current.getValue('u_result')!=='HOLD')return;\n var a=new GlideRecord('sysapproval_approver');a.initialize();\n a.sysapproval=current.getUniqueValue();a.approver=gs.getUserID();a.state='requested';\n a.setWorkflow(false); // PDI demonstration only: suppress notifications, no external recipient.\n if(!a.insert())gs.error('Finance demo review creation failed for '+current.getValue('number'));\n})(current, previous);";
 if(found)b.update();else b.insert();
 var before=new GlideRecord('sys_script');before.get('name','Finance Demo - Classify Invoice');
 before.script=String(before.script).replace("current.approval='not requested';", "current.approval=result.status==='HOLD'?'requested':'not requested';");before.update();
 var l=new GlideRecord('sys_ui_list');l.addQuery('name','u_fin_invoice_case');l.addNullQuery('sys_user');l.addQuery('view','Default view');l.query();
 if(!l.next()) {l.initialize();l.name='u_fin_invoice_case';l.view='Default view';var lid=l.insert();
  var cols=['number','short_description','u_result','u_reasons','u_held_cents','approval'];
  for(var k=0;k<cols.length;k++){var e=new GlideRecord('sys_ui_list_element');e.initialize();e.list_id=lid;e.element=cols[k];e.position=k;e.insert();}}
 gs.print('AUTOMATIC HOLD REVIEW INSTALLED. New HOLD cases create one requested review for the demo administrator.');
})();