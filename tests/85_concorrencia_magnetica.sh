#!/usr/bin/env bash
# Migração 14, concorrência real (sessões paralelas): dois operadores tocando em "Engaxetamento
# realizado" ao mesmo tempo, o mesmo pacote enviado em paralelo e várias placas com a mesma
# credencial. Roda depois da suíte 84 (usa o sensor ESP32-MAGNE00000B1 e a geometria do spot B).
set -uo pipefail
export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
DB="${1:-gaxeta_dev}"; S=ESP32-MAGNE00000B1; TOK=dev-token-0123456789abcdef0123456789abcdef
q() { psql -q -At -v ON_ERROR_STOP=1 -d "$DB" "$@"; }
q -c "select set_config('t.suite','85 concorrência magnética',false)" >/dev/null
# Prepara: geometria validada no spot B e nenhuma solicitação em aberto.
q -c "begin; select t.login(t.id('adm2')); select public.gaxeta_mag_set_point_setup(t.id('mag_sB'), t.id_text('g_a')::bigint, null, null, null); commit;" >/dev/null
# (1) Dois operadores, solicitações diferentes, 8 sessões ao mesmo tempo: exatamente uma pendente.
for i in 1 2 3 4 5 6 7 8; do
  u=$([ $((i % 2)) = 0 ] && echo adm1 || echo adm2)
  q -c "begin; select t.login(t.id('$u')); select public.gaxeta_mag_request_service('$S', gen_random_uuid(), 30, 'measured'); commit;" >/tmp/c85_$i.log 2>&1 &
done; wait
OKS=$(grep -l '"status": "pending"' /tmp/c85_*.log | wc -l); ERR=$(grep -l 'aguardando leitura' /tmp/c85_*.log | wc -l)
q -c "select set_config('t.suite','85 concorrência magnética',false); select t.eq('$OKS/$ERR'::text, '1/7', 'oito cliques simultâneos de dois operadores: uma solicitação aceita, sete com pendência explícita');
      select t.eq((select count(*) from gaxeta_private.mag_services where sensor_id = '$S' and status = 'pending'), 1::bigint, 'uma única solicitação pendente no vínculo');"
# (2) O mesmo pacote (mesma sequência) enviado por 6 sessões: uma linha, uma referência.
q -c "update gaxeta_private.mag_services set requested_at = requested_at - interval '10 seconds' where sensor_id = '$S' and status = 'pending'; update public.gaxeta_devices set last_received_at = last_received_at - interval '5 seconds' where sensor_id = '$S';" >/dev/null
BOOT=eeeeeeeeeeeeeeee5555555555555555
PAY="{\"schema_version\":4,\"modality\":\"as5600_i2c\",\"sensor_id\":\"$S\",\"boot_id\":\"$BOOT\",\"sequence\":1,\"origin\":\"esp32\",\"raw_angle\":700,\"angle_pp\":1,\"mag_status\":\"ok\",\"bus_status\":\"ok\",\"rssi\":-50,\"send_period_s\":30,\"sampled_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
for i in 1 2 3 4 5 6; do q -c "begin; select t.anon(); select public.gaxeta_ingest_v4('$TOK', '$PAY'::jsonb); commit;" >/tmp/d85_$i.log 2>&1 & done; wait
NEW=$(grep -l '"duplicate": false' /tmp/d85_*.log | wc -l); DUP=$(grep -l '"duplicate": true' /tmp/d85_*.log | wc -l); LIM=$(grep -l 'PT429\|Aguarde antes' /tmp/d85_*.log | wc -l)
q -c "select set_config('t.suite','85 concorrência magnética',false);
      select t.eq('$NEW'::text, '1', 'pacote repetido em paralelo: uma única inserção ($DUP duplicatas, $LIM recusas por intervalo mínimo)');
      select t.eq((select count(*) from public.gaxeta_readings where sensor_id = '$S' and boot_id = '$BOOT' and sequence = 1), 1::bigint, 'uma única linha para sensor/boot/sequência');
      select t.eq((select count(*) || '|' || max(ref_raw_angle) from gaxeta_private.mag_services where sensor_id = '$S' and status = 'active'), '1|700', 'exatamente uma referência ativa, ligada à amostra correta');"
# (3) Dez placas novas com a mesma credencial, ao mesmo tempo: nenhuma espera a outra até estourar o tempo.
q -c "update gaxeta_private.ingest_keys set max_devices = 60" >/dev/null
T0=$(date +%s%N)
for i in 0 1 2 3 4 5 6 7 8 9; do
  P="{\"schema_version\":4,\"modality\":\"as5600_i2c\",\"sensor_id\":\"ESP32-MAGPAR00000$i\",\"boot_id\":\"$BOOT\",\"sequence\":1,\"origin\":\"esp32\",\"raw_angle\":$((i * 100)),\"angle_pp\":1,\"mag_status\":\"ok\",\"bus_status\":\"ok\",\"sampled_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
  q -c "begin; select t.anon(); select public.gaxeta_ingest_v4('$TOK', '$P'::jsonb); commit;" >/tmp/e85_$i.log 2>&1 &
done; wait
MS=$(( ($(date +%s%N) - T0) / 1000000 ))
q -c "select set_config('t.suite','85 concorrência magnética',false);
      select t.eq((select count(*) from public.gaxeta_devices where sensor_id like 'ESP32-MAGPAR%' and last_raw_angle is not null), 10::bigint, 'dez placas novas com a mesma credencial, em paralelo: dez sensores criados, cada um com a sua leitura (${MS} ms)');"
