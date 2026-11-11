-- Simulação SOMENTE LEITURA, sem criar nenhum objeto. Pode ser executada em produção.
-- Parâmetros: :sensor (texto), :n (inteiro), :dedupe (intervalo). Ex.:
--   psql -v sensor="'<ID_DO_SENSOR>'" -v n=60000 -v dedupe="'24 hours'" -f limpeza/01_simulacao_somente_leitura.sql
with first_n as (
  select r.id, r.received_at, r.boot_id, r.sequence, row_number() over (order by r.received_at desc, r.id desc) as from_end
    from (select * from public.gaxeta_readings where sensor_id = :sensor order by received_at asc, id asc limit :n) r
), dev as (select last_boot_id, last_sequence, reading_count, stable_percent, stable_since, last_received_at from public.gaxeta_devices where sensor_id = :sensor),
c as (
  select f.*, case when exists (select 1 from public.gaxeta_movements m where m.reading_id = f.id) then 'movimento'
                   when f.from_end = 1 then 'referencia'
                   when exists (select 1 from dev where dev.last_boot_id = f.boot_id and dev.last_sequence = f.sequence) then 'referencia'
                   when f.received_at >= now() - (:dedupe)::interval then 'deduplicacao' end as protection
    from first_n f
), tot as (select count(*) n, min(received_at) f, max(received_at) l from public.gaxeta_readings where sensor_id = :sensor)
select jsonb_build_object(
  'simulado_em', now(), 'sensor', :sensor, 'leituras_do_sensor', (select n from tot), 'mais_antiga', (select f from tot), 'mais_recente', (select l from tot),
  'primeiras_n', (select count(*) from c), 'recorte_de', (select min(received_at) from c), 'recorte_ate', (select max(received_at) from c),
  'protegidas_por_movimento', (select count(*) from c where protection = 'movimento'),
  'protegidas_como_referencia', (select count(*) from c where protection = 'referencia'),
  'protegidas_por_deduplicacao', (select count(*) from c where protection = 'deduplicacao'),
  'seriam_removidas', (select count(*) from c where protection is null),
  'permaneceriam_no_sensor', (select n from tot) - (select count(*) from c where protection is null),
  'brutas_apos_o_recorte', (select n from tot) - (select count(*) from c),
  'horas_brutas_retidas', round(extract(epoch from (select l from tot) - (select max(received_at) from c)) / 3600.0, 1),
  'boots_no_recorte', (select count(distinct boot_id) from c), 'boot_atual_no_recorte', (select count(*) from c, dev where c.boot_id = dev.last_boot_id),
  'movimentos_do_sensor', (select count(*) from public.gaxeta_movements where sensor_id = :sensor),
  'reading_count_acumulado', (select reading_count from dev), 'estavel', (select stable_percent from dev), 'referencia_desde', (select stable_since from dev),
  'ultima_recepcao', (select last_received_at from dev),
  'outros_dispositivos_intocados', (select jsonb_object_agg(sensor_id, n) from (select sensor_id, count(*) n from public.gaxeta_readings where sensor_id <> :sensor group by 1) o)
) as simulacao;
