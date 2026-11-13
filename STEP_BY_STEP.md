# Hands-on guide: manufacturing invoice exception review

## 1. Understand the problem

A factory receives invoices for purchased components. Re-entered invoice identifiers, unexpected prices or incomplete deliveries require accounts-payable investigation. ServiceNow can hold the operational case, retain evidence and request review while the ERP remains the system responsible for accounting and payments.

Read the local OpenStax finance PDF for working-capital background and the author-provided ServiceNow Business Rules, Debugging and Update Sets excerpts. References and licensing limits are in SOURCES.md. All fixtures in this project are invented training examples.

## 2. Inspect the completed project

1. Sign in to your PDI as administrator.
2. Open `/u_fin_invoice_case_list.do?sysparm_query=correlation_idSTARTSWITHFINDEMO-V1-&sysparm_view=default` on your instance.
3. Confirm four records: TASK0020267 through TASK0020270. The filter excludes the separate automation test.
4. Read Control result and Exception reasons. Scroll horizontally to Held exposure (USD cents) and Approval.
5. Convert cents to dollars: 110000 / 100 = 1100; 100000 / 100 = 1000; 200000 / 100 = 2000. The sum is 4100.
6. Open a case. Review its payload and description. Use the form configuration tools to add custom fields or the Approvers related list if your current form does not display them.
7. In the application navigator, search `Invoice Control Cases (Demo)`. Refresh the navigator if the newly created module has not appeared yet.

## 3. Reproduce on a separate PDI

These scripts change application metadata; use a development instance and record for rollback. They are not an update-set export and are not intended for production deployment. Table creation extends Task and may take several seconds. No existing Course Request records are modified.

1. Open All → System Definition → Scripts - Background.
2. Keep scope `global` and `Record for rollback` checked. Leave `Execute in sandbox` unchecked because installation must save the new metadata.
3. Paste `servicenow/01-schema.js`, run it once, and wait for `SCHEMA READY`. It creates `u_fin_invoice_case` extending Task and eight fields. Reload the runner afterward so the schema is visible.
4. Run `02-install-policy.js`. Expected message: `POLICY INSTALLED`. It saves the Script Include, before Business Rule, application menu and module.
5. Run `03-seed-and-verify.js`. Expected: four PASS lines and 4100.00 USD held exposure.
6. Run `04-request-review.js` to create the initial three requested review records for the current demo administrator. It checks for existing reviewer/record pairs before inserting.
7. Run `05-automate-review.js` to add the after-insert review rule and list columns.
8. Run `06-verify-automation.js`. Expected: a new held test case with exactly one requested approval, a rejected zero-quantity case, and unchanged four-case totals. The deliberately rejected case prints an expected validation error.
9. Run `07-final-checks.js` for a repeatable final check including immutable payload verification. It intentionally attempts a rejected update; existing submitted payload is checked afterward.
10. Open the case list. Capture the classifications and, after scrolling right, amounts and approval states.

Run scripts sequentially. They check for existing named demo records; do not rename existing objects to collide with the names used here. A locally successful syntax check does not establish compatibility with ServiceNow's older global JavaScript parser; the included scripts were also run in the actual PDI.

## 4. Try a new case

1. Open the case list and select New.
2. Add the `Invoice and PO snapshot JSON` field to your form if needed.
3. Set Short description to `[FINDEMO] My price test` and use this payload:

```json
{"po_key":"PO-SYNTH-PRACTICE","invoice":{"supplier":"SYNTH-PRACTICE","invoice":"PRACTICE-001","qty":1,"unit_cents":11000,"currency":"USD"},"po":{"supplier":"SYNTH-PRACTICE","qty":1,"received":1,"unit_cents":10000,"currency":"USD"}}
```

4. Submit. Expected: HOLD, PRICE_MISMATCH, 11000 held cents, Approval Requested, and one reviewer record for the submitting demo administrator.
5. Try quantity zero in a different new case. Expected: save rejected; no case persists.
6. Submitted JSON cannot be edited. This keeps the original intake evidence intact. Production correction/replacement and final resolution flows have not been built.

## 5. Learn the implementation

- Script Include: one reusable pure classification function.
- Before Business Rule: parse and normalize input, query persisted duplicate keys, validate, populate result fields or abort save.
- After-insert Business Rule: request human review for a newly held case.
- Task inheritance: number, short description, state and approval fields are inherited.
- Workflow Studio alternative: replace after-insert approval creation with a flow using a record-created trigger, HOLD condition and Ask for Approval action, with explicit approved/rejected/timeout branches. Disable the after rule first to avoid duplicate requests. This alternative is a design exercise and was not installed or tested in this project.

## 6. Publishing safely

Publish only original source, synthetic JSON, the guide, the prompt and screenshot evidence. Leave third-party PDFs and private account data out of the repository. Keep the evidence clear about local policy tests versus actual ServiceNow results.
