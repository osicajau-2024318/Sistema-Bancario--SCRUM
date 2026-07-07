#!/usr/bin/env bash
# Pruebas E2E auth Banco — login, registro y mensajes de error
set -euo pipefail

AUTH_BASE="${AUTH_BASE:-http://localhost:5025/api/v1/Auth}"
TS=$(date +%s)
TEST_USER="testuser_${TS}"
TEST_EMAIL="test_${TS}@kinal.edu.gt"
PASS="TestPass123!"

pass() { echo "✅ $1"; }
fail() { echo "❌ $1"; exit 1; }
section() { echo ""; echo "=== $1 ==="; }

section "1) Health"
HEALTH=$(curl -s "${AUTH_BASE%/Auth}/Health")
echo "$HEALTH" | grep -qi healthy && pass "Auth service healthy" || fail "Auth no responde"

section "2) Login admin (ADMINB)"
ADMIN_RESP=$(curl -s -w "\n%{http_code}" -X POST "$AUTH_BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"ADMINB","password":"ADMINB"}')
ADMIN_CODE=$(echo "$ADMIN_RESP" | tail -1)
ADMIN_BODY=$(echo "$ADMIN_RESP" | sed '$d')
echo "$ADMIN_BODY" | head -c 200; echo ""
[[ "$ADMIN_CODE" == "200" ]] && echo "$ADMIN_BODY" | grep -qi '"token"' && pass "Admin login OK ($ADMIN_CODE)" || fail "Admin login falló ($ADMIN_CODE)"

section "3) Credenciales incorrectas"
BAD_RESP=$(curl -s -w "\n%{http_code}" -X POST "$AUTH_BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"ADMINB","password":"wrongpassword"}')
BAD_CODE=$(echo "$BAD_RESP" | tail -1)
BAD_BODY=$(echo "$BAD_RESP" | sed '$d')
echo "HTTP $BAD_CODE → $BAD_BODY"
[[ "$BAD_CODE" == "401" ]] && pass "401 en credenciales malas" || fail "Esperaba 401, obtuvo $BAD_CODE"
if echo "$BAD_BODY" | grep -qiE 'invalid credentials|credenciales'; then
  pass "Mensaje específico de credenciales (no genérico vacío)"
else
  echo "⚠️  Mensaje aún genérico — revisar middleware"
fi

section "4) Registro usuario nuevo ($TEST_USER)"
REG_RESP=$(curl -s -w "\n%{http_code}" -X POST "$AUTH_BASE/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"surname\":\"User\",\"username\":\"$TEST_USER\",\"email\":\"$TEST_EMAIL\",\"password\":\"$PASS\",\"phone\":\"12345678\"}")
REG_CODE=$(echo "$REG_RESP" | tail -1)
REG_BODY=$(echo "$REG_RESP" | sed '$d')
echo "HTTP $REG_CODE → $(echo "$REG_BODY" | head -c 250)"
[[ "$REG_CODE" == "201" || "$REG_CODE" == "200" ]] && pass "Registro OK ($REG_CODE)" || fail "Registro falló ($REG_CODE)"

section "5) Login usuario recién registrado (debe fallar: pendiente + email)"
NEW_RESP=$(curl -s -w "\n%{http_code}" -X POST "$AUTH_BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrUsername\":\"$TEST_EMAIL\",\"password\":\"$PASS\"}")
NEW_CODE=$(echo "$NEW_RESP" | tail -1)
NEW_BODY=$(echo "$NEW_RESP" | sed '$d')
echo "HTTP $NEW_CODE → $NEW_BODY"
[[ "$NEW_CODE" == "401" ]] && pass "Login bloqueado como esperado ($NEW_CODE)" || fail "Esperaba 401, obtuvo $NEW_CODE"
if echo "$NEW_BODY" | grep -qiE 'pendiente|activación|activacion|email not verified|verif'; then
  pass "Mensaje claro de cuenta pendiente/verificación"
else
  echo "⚠️  Solo mensaje genérico — middleware Docker puede estar desactualizado"
fi

section "6) Ruta cliente móvil (/api/v1/Auth/login)"
MOBILE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$AUTH_BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"noexiste","password":"x"}')
[[ "$MOBILE_CODE" == "401" ]] && pass "Ruta /api/v1/Auth/login responde ($MOBILE_CODE)" || fail "Ruta móvil falló ($MOBILE_CODE)"

section "7) Ruta incorrecta antigua (/api/v1/login) — debe fallar"
OLD_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:5025/api/v1/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"ADMINB","password":"ADMINB"}')
[[ "$OLD_CODE" == "404" || "$OLD_CODE" == "405" ]] && pass "Ruta sin /Auth no funciona ($OLD_CODE) — confirma config correcta" || echo "⚠️  Ruta antigua respondió $OLD_CODE"

echo ""
echo "=== RESUMEN ==="
echo "Auth base: $AUTH_BASE"
echo "Usuario prueba: $TEST_EMAIL / $PASS"
echo "Listo."
