import json
import base64
import urllib.request

# Login
req = urllib.request.Request('http://localhost:5025/api/v1/auth/login',
    data=json.dumps({"emailOrUsername":"ADMINB","password":"ADMINB"}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST')
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read())
token = data['token']

# Decodificar payload
parts = token.split('.')
# Agregar padding
payload = parts[1] + '=' * (4 - len(parts[1]) % 4)
decoded = base64.urlsafe_b64decode(payload)
print(json.dumps(json.loads(decoded), indent=2))
