-- Uso: psql -v label="'<rótulo>'" -f tests/81_medir_history.sql  (requer t.time_history)
-- Cada chamada é um comando próprio, com o mesmo limite de 8 s que a API aplica ao papel authenticated.
\set u '00000000-0000-4000-a000-000000000001'
set statement_timeout = '8s';
select t.time_history(:label, :'u', 'ESP32-PERF00066K', '1 hour'::interval);
select t.time_history(:label, :'u', 'ESP32-PERF00066K', '1 day'::interval);
select t.time_history(:label, :'u', 'ESP32-PERF00066K', '7 days'::interval);
select t.time_history(:label, :'u', 'ESP32-PERF00066K', '31 days'::interval);
select t.time_history(:label, :'u', 'ESP32-PERF00066K', '92 days'::interval);
select t.time_history(:label, :'u', 'ESP32-PERF00780K', '1 day'::interval);
select t.time_history(:label, :'u', 'ESP32-PERF00780K', '7 days'::interval);
select t.time_history(:label, :'u', 'ESP32-PERF00780K', '31 days'::interval);
select t.time_history(:label, :'u', 'ESP32-PERF00780K', '92 days'::interval);
