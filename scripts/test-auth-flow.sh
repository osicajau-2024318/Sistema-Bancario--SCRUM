#!/usr/bin/env bash
# Flujo completo: registro → login bloqueado → admin activa → login OK
set -euo pipefail

AUTH_BASE="${AUTH_BASE:-http://localhost:5025/api/v1/Auth}"
ADMIN_BASE="${ADMIN_BASE:-http://localhost:5025/api/v1/admin}"
TS=$(date +%s)
TEST_USER="flow_${TS}"
TEST_EMAIL="flow_${TS}@kinal.edu.gt"
PASS="TestPass123!"

pass() { echo "✅ $1"; }
fail() { echo "❌ $1"; exit 1; }

echo "=== Flujo completo registro → activación admin ==="

# 1. Registro
REG=$(curl -s -X POST "$AUTH_BASE/register" -H "Content-Type: application/json" \
  -d "{\"name\":\"Flow\",\"surname\":\"Test\",\"username\":\"$TEST_USER\",\"email\":\"$TEST_EMAIL\",\"password\":\"$PASS\",\"phone\":\"87654321\"}")
USER_ID=$(echo "$REG" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user',{}).get('id',''))" 2>/dev/null || true)
[[ -n "$USER_ID" ]] && pass "Registro OK — userId=$USER_ID" || fail "No se obtuvo userId: $REG"

# 2. Login antes de activar
CODE=$(curl -s -o /tmp/login1.json -w "%{http_code}" -X POST "$AUTH_BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrUsername\":\"$TEST_EMAIL\",\"password\":\"$PASS\"}")
MSG=$(python3 -c "import json; print(json.load(open('/tmp/login1.json')).get('message',''))" 2>/dev/null || cat /tmp/login1.json)
[[ "$CODE" == "401" ]] && echo "$MSG" | grep -qi pendiente && pass "Login bloqueado: $MSG" || fail "Esperaba pendiente, got $CODE: $MSG"

# 3. Admin login
ADMIN_JSON=$(curl -s -X POST "$AUTH_BASE/login" -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"ADMINB","password":"ADMINB"}')
ADMIN_TOKEN=$(echo "$ADMIN_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")
[[ -n "$ADMIN_TOKEN" ]] && pass "Admin token obtenido" || fail "Admin login falló"

# 4. Admin activa usuario
ACT_CODE=$(curl -s -o /tmp/act.json -w "%{http_code}" -X POST "$ADMIN_BASE/users/$USER_ID/activate" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json")
echo "Activación HTTP $ACT_CODE → $(cat /tmp/act.json | head -c 200)"
[[ "$ACT_CODE" == "200" || "$ACT_CODE" == "204" ]] && pass "Admin activó cuenta" || fail "Activación falló ($ACT_CODE)"

# 5. Login después de activar
CODE2=$(curl -s -o /tmp/login2.json -w "%{http_code}" -X POST "$AUTH_BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrUsername\":\"$TEST_EMAIL\",\"password\":\"$PASS\"}")
LOGIN2=$(cat /tmp/login2.json)
[[ "$CODE2" == "200" ]] && echo "$LOGIN2" | grep -qi '"token"' && pass "Login OK tras activación admin" || fail "Login post-activación falló ($CODE2): $LOGIN2"

echo ""
echo "=== FLUJO COMPLETO OK ==="
echo "Usuario: $TEST_EMAIL / $PASS"
