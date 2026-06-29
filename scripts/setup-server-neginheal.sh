#!/usr/bin/env bash
# Run on the server as root from /siya/smart-furnish:
#   bash scripts/setup-server-neginheal.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DOMAIN="smartfurnish.neginheal.ir"
PUBLIC_URL="https://${DOMAIN}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@neginheal.ir}"

set_env_var() {
  local file="$1"
  local key="$2"
  local value="$3"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

echo "==> Checking project at ${ROOT_DIR}"
if [[ ! -f package.json ]] || [[ ! -f ecosystem.config.cjs ]]; then
  echo "Not a smart-furnish repo root: ${ROOT_DIR}"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required (v20+)."
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing PM2 globally..."
  npm install -g pm2
fi

if [[ ! -f api/.env ]]; then
  echo "==> Creating api/.env from example..."
  cp api/.env.example api/.env
fi

if [[ ! -f app/.env ]]; then
  echo "==> Creating app/.env from example..."
  cp app/.env.example app/.env
fi

echo "==> Setting production URLs for ${DOMAIN}..."
set_env_var api/.env NODE_ENV production
set_env_var api/.env PORT 5801
set_env_var api/.env BASE_URL "${PUBLIC_URL}"
set_env_var api/.env APP_URL "${PUBLIC_URL}"
set_env_var api/.env GRAPHQL_PLAYGROUND false
set_env_var api/.env GRAPHQL_INTROSPECTION false

set_env_var app/.env PORT 5800
set_env_var app/.env VITE_APP_URL "${PUBLIC_URL}"
set_env_var app/.env VITE_API_BASE_URL "${PUBLIC_URL}"
set_env_var app/.env VITE_ALLOWED_HOSTS "${DOMAIN}"
set_env_var app/.env VITE_NODE_ENV production
set_env_var app/.env VITE_EXPOSE_VIA_NETWORK true

echo "==> Building and starting PM2 services..."
npm run deploy

echo "==> Installing nginx site config..."
cp deploy/nginx/smartfurnish.neginheal.ir.conf /etc/nginx/sites-available/smartfurnish.neginheal.ir
ln -sf /etc/nginx/sites-available/smartfurnish.neginheal.ir /etc/nginx/sites-enabled/smartfurnish.neginheal.ir

if [[ ! -f /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ]]; then
  echo "==> Obtaining Let's Encrypt certificate for ${DOMAIN}..."
  if command -v certbot >/dev/null 2>&1; then
    # HTTP-only block is enough for the ACME challenge; certbot adds SSL lines.
    certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${CERTBOT_EMAIL}" --redirect || true
  else
    echo "certbot not installed; nginx will serve HTTP only until you run:"
    echo "  certbot --nginx -d ${DOMAIN}"
  fi
fi

echo "==> Reloading nginx..."
nginx -t
systemctl reload nginx

echo "==> PM2 status"
pm2 status

echo
echo "Setup complete."
echo "  App:  ${PUBLIC_URL}"
echo "  API:  ${PUBLIC_URL}/graphql"
echo
echo "Useful commands:"
echo "  pm2 logs"
echo "  pm2 status"
echo "  cd ${ROOT_DIR} && npm run deploy"
