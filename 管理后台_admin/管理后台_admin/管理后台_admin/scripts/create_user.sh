#!/usr/bin/env bash
# SCMS 星门后台创建用户脚本 / Admin Create User Script
USER=$1
PASS=$2
if [ -z "$USER" ] || [ -z "$PASS" ]; then
  echo "Usage: $0 username password"
  exit 1
fi

DOVECOT_HASH=$(doveadm pw -s SHA512-CRYPT -p "$PASS")
echo "${USER}:${DOVECOT_HASH}:1000:1000::/var/mail/${USER}::" >> /etc/dovecot/passwd
mkdir -p /var/mail/${USER}/Maildir
chown -R vmail:vmail /var/mail/${USER}
echo "Created user ${USER}"
