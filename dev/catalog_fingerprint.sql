-- Impressão digital do catálogo do aplicativo (schemas public e gaxeta_private).
-- Mesma consulta em produção e na base restaurada; MAINTAIN (PG17+) fica fora da comparação.
select k, md5(d) as h, d from (
  select 'col:'||c.relnamespace::regnamespace::text||'.'||c.relname||'.'||a.attname as k,
         a.attnum||'|'||format_type(a.atttypid,a.atttypmod)||'|'||a.attnotnull||'|'||coalesce(pg_get_expr(ad.adbin,ad.adrelid),'')||'|'||a.attidentity::text as d
    from pg_attribute a join pg_class c on c.oid=a.attrelid left join pg_attrdef ad on ad.adrelid=a.attrelid and ad.adnum=a.attnum
   where c.relkind='r' and c.relnamespace::regnamespace::text in ('public','gaxeta_private') and a.attnum>0 and not a.attisdropped
  union all
  select 'con:'||conrelid::regclass::text||'.'||conname, contype::text||'|'||pg_get_constraintdef(oid)
    from pg_constraint where connamespace::regnamespace::text in ('public','gaxeta_private')
  union all
  select 'idx:'||schemaname||'.'||indexname, indexdef from pg_indexes where schemaname in ('public','gaxeta_private')
  union all
  select 'pol:'||schemaname||'.'||tablename||'.'||policyname, permissive||'|'||cmd||'|'||array_to_string(roles,',')||'|'||coalesce(qual,'')||'|'||coalesce(with_check,'')
    from pg_policies where schemaname in ('public','gaxeta_private')
  union all
  select 'trg:'||c.relnamespace::regnamespace::text||'.'||c.relname||'.'||t.tgname, t.tgenabled::text||'|'||pg_get_triggerdef(t.oid)
    from pg_trigger t join pg_class c on c.oid=t.tgrelid where not t.tgisinternal and c.relnamespace::regnamespace::text in ('public','gaxeta_private')
  union all
  select 'fn:'||p.pronamespace::regnamespace::text||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')',
         pg_get_function_result(p.oid)||'|'||pg_get_function_arguments(p.oid)||'|'||l.lanname||'|'||p.prosecdef||'|'||p.provolatile::text||'|'||coalesce(array_to_string(p.proconfig,','),'')
         ||'|'||md5(regexp_replace(p.prosrc,'\s+','','g'))||'|'||md5(btrim(regexp_replace(p.prosrc,'\s+',' ','g')))
    from pg_proc p join pg_language l on l.oid=p.prolang where p.pronamespace::regnamespace::text in ('public','gaxeta_private')
  union all
  select 'fnacl:'||p.pronamespace::regnamespace::text||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')',
         (select coalesce(string_agg(case when x.grantee=0 then 'PUBLIC' else x.grantee::regrole::text end||'='||x.privilege_type, ',' order by (case when x.grantee=0 then 'PUBLIC' else x.grantee::regrole::text end) collate "C", x.privilege_type),'')
            from aclexplode(coalesce(p.proacl, acldefault('f',p.proowner))) x where x.grantee<>p.proowner)
    from pg_proc p where p.pronamespace::regnamespace::text in ('public','gaxeta_private')
  union all
  select 'relacl:'||c.relnamespace::regnamespace::text||'.'||c.relname,
         c.relkind::text||'|rls='||c.relrowsecurity||'|force='||c.relforcerowsecurity||'|'||
         (select coalesce(string_agg(case when x.grantee=0 then 'PUBLIC' else x.grantee::regrole::text end||'='||x.privilege_type, ',' order by (case when x.grantee=0 then 'PUBLIC' else x.grantee::regrole::text end) collate "C", x.privilege_type),'')
            from aclexplode(coalesce(c.relacl, acldefault(case when c.relkind='S' then 's'::"char" else 'r'::"char" end,c.relowner))) x where x.grantee<>c.relowner and x.privilege_type<>'MAINTAIN')
    from pg_class c where c.relkind in ('r','S','v','m') and c.relnamespace::regnamespace::text in ('public','gaxeta_private')
  union all
  select 'nspacl:'||n.nspname,
         (select coalesce(string_agg(case when x.grantee=0 then 'PUBLIC' else x.grantee::regrole::text end||'='||x.privilege_type, ',' order by (case when x.grantee=0 then 'PUBLIC' else x.grantee::regrole::text end) collate "C", x.privilege_type),'')
            from aclexplode(coalesce(n.nspacl, acldefault('n',n.nspowner))) x where x.grantee<>n.nspowner)
    from pg_namespace n where n.nspname='gaxeta_private'
  union all
  select 'comment:'||p.pronamespace::regnamespace::text||'.'||p.proname, ds.description
    from pg_description ds join pg_proc p on p.oid=ds.objoid and ds.classoid='pg_proc'::regclass where p.pronamespace::regnamespace::text in ('public','gaxeta_private')
) s
