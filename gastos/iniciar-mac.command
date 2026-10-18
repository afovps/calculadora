#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo
  echo "  Para usar el servidor necesitas instalar Node.js (gratis): https://nodejs.org"
  echo "  Instala la versión LTS y vuelve a abrir este archivo."
  echo "  Mientras tanto puedes abrir index.html directamente en el navegador."
  open https://nodejs.org
  read -r -p "  Pulsa Enter para cerrar..."
  exit 1
fi
node server.js
