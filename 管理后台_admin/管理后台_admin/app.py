import os
from flask import Flask, request, jsonify, abort
from passlib.hash import sha512_crypt
from subprocess import run
from dotenv import load_dotenv

load_dotenv()
ADMIN_SECRET = os.environ.get('ADMIN_SECRET') or 'devsecret'
MAIL_DOMAIN = os.environ.get('MAIL_DOMAIN') or 'lyurchxieria.com'
MAIL_STORAGE = os.environ.get('MAIL_STORAGE') or '/var/mail'
DKIM_DIR = os.environ.get('DKIM_DIR') or '/data/dkim'

app = Flask(__name__)

# 🌌 SCMS 星门简单后台认证
def require_auth(req):
    key = req.headers.get('X-ADMIN-SECRET')
    if key != ADMIN_SECRET:
        abort(401)

# 创建用户 / Create user
@app.route('/user', methods=['POST'])
def create_user():
    require_auth(request)
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error':'username & password required'}), 400

    passwd_path = '/etc/dovecot/passwd'
    entry = f"{username}:{sha512_crypt.hash(password)}:1000:1000::/var/mail/{username}::\n"
    with open(passwd_path, 'a') as f:
        f.write(entry)

    maildir = f"/var/mail/{username}/Maildir"
    run(['mkdir', '-p', maildir])
    run(['chown', '-R', 'vmail:vmail', f"/var/mail/{username}"])

    return jsonify({'ok':True, 'username':username})

# 生成 DKIM / Generate DKIM
@app.route('/dkim', methods=['POST'])
def gen_dkim():
    require_auth(request)
    selector = request.json.get('selector','default')
    domain = MAIL_DOMAIN
    dkim_path = os.path.join(DKIM_DIR, domain)
    os.makedirs(dkim_path, exist_ok=True)
    private_key = os.path.join(dkim_path, f"{selector}.private")
    public_key = os.path.join(dkim_path, f"{selector}.pub")

    run(['openssl', 'genrsa', '-out', private_key, '1024'], check=True)
    run(['openssl', 'rsa', '-in', private_key, '-pubout', '-out', public_key], check=True)

    pub = open(public_key).read()
    pub_body = ''.join(pub.split('\n')[1:-1])
    txt = f"v=DKIM1; k=rsa; p={pub_body}"
    dns_record = {
        'name': f"{selector}._domainkey.{domain}",
        'type': 'TXT',
        'value': txt
    }
    return jsonify(dns_record)

# DNS 模板 / DNS Template
@app.route('/dns-template', methods=['GET'])
def dns_template():
    require_auth(request)
    domain = MAIL_DOMAIN
    template = {
        'MX': {
            'name': domain,
            'type': 'MX',
            'value': f"10 {os.environ.get('MAIL_HOST')}"
        },
        'SPF': {
            'name': domain,
            'type': 'TXT',
            'value': f"v=spf1 mx -all"
        },
        'DMARC': {
            'name': f"_dmarc.{domain}",
            'type': 'TXT',
            'value': 'v=DMARC1; p=none; rua=mailto:postmaster@' + domain
        }
    }
    return jsonify(template)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
