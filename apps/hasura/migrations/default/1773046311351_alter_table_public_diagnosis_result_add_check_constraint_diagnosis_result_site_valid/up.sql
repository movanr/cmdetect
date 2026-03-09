alter table "public"."diagnosis_result" add constraint "diagnosis_result_site_valid" check (site IS NULL OR site IN ('posteriorMandibular', 'submandibular', 'lateralPterygoid', 'temporalisTendon'));
