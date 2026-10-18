#!/bin/sh
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Para usar el servidor necesitas Node.js: https://nodejs.org (o: sudo apt install nodejs)"
  echo "Mientras tanto puedes abrir index.html directamente en el navegador."
  exit 1
fi
exec node server.js "$@"
