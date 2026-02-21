#!/bin/bash
# Elimina raf-app del repo y deja un solo commit listo para push.
# Ejecutar en Git Bash: bash quitar-raf-app-del-git.sh

set -e
cd "$(dirname "$0")"

echo "Creando rama temporal sin historial..."
git checkout --orphan temp_branch main

echo "Añadiendo todo excepto raf-app..."
git add -A
git rm -rf --cached raf-app 2>/dev/null || true
git status

echo "Creando un solo commit limpio..."
git commit -m "RAF Matemáticas E.S.T. - Next.js PWA con login y por nivel"

echo "Reemplazando main..."
git branch -D main
git branch -m main

echo "Listo. Ejecuta: git push -u origin main"
echo "(Si pide confirmación por reescribir historial: git push -u origin main --force)"
