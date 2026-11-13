// PDI ONLY. Creates a new isolated Task extension and demo fields. No deletes or ACL changes.
(function(){
 var name='u_fin_invoice_case';
 var existing=new GlideRecord('sys_db_object');existing.addQuery('name',name);existing.query();
 if (!existing.next()) {
   var task=new GlideRecord('sys_db_object');task.get('name','task');
   var table=new GlideRecord('sys_db_object');table.initialize();table.name=name;
   table.label='Finance Invoice Case';table.super_class=task.getUniqueValue();
   var id=table.insert(); if(!id)throw 'Table creation failed';
   gs.print('CREATED TABLE '+name);
 } else gs.print('TABLE EXISTS '+name);
 var fields=[['u_payload','Invoice and PO snapshot JSON','string',8000],['u_supplier','Supplier ID','string',80],
 ['u_invoice_key','Invoice number','string',100],['u_po_key','Purchase order','string',100],
 ['u_result','Control result','string',40],['u_reasons','Exception reasons','string',1000],
 ['u_amount_cents','Invoice amount (USD cents)','integer',40],['u_held_cents','Held exposure (USD cents)','integer',40]];
 for(var k=0;k<fields.length;k++){
   var f=fields[k],d=new GlideRecord('sys_dictionary');d.addQuery('name',name);d.addQuery('element',f[0]);d.query();
   if(!d.next()){d.initialize();d.name=name;d.element=f[0];d.column_label=f[1];d.internal_type=f[2];d.max_length=f[3];
     var fid=d.insert();if(!fid)throw 'Field failed '+f[0];gs.print('CREATED FIELD '+f[0]);}
 }
 gs.print('SCHEMA READY. Reload runner before installing rules.');
})();
