# Cómo subir el código a GitHub (WeroMilk/raf_est)

El repositorio en GitHub está vacío porque el **push** debe hacerse desde tu equipo y requiere que **tú** te autentiques. El código ya está commiteado en tu carpeta local.

## Opción A: Push desde Git Bash o terminal (recomendado)

1. Abre **Git Bash** (o la terminal donde tengas `git` disponible).
2. Ve a la carpeta del proyecto:
   ```bash
   cd "C:\Users\alfon\proyectos\Mtra. Marta Camargo"
   ```
3. Sube el código:
   ```bash
   git push -u origin main
   ```
4. Si usas **SSH** y te pide la contraseña de tu clave, escríbela.
5. Si te pide **usuario y contraseña** (por HTTPS), en GitHub ya no se usa la contraseña de la cuenta. Debes usar un **Personal Access Token**:
   - Ve a: https://github.com/settings/tokens
   - "Generate new token (classic)", marca al menos `repo`.
   - Copia el token y úsalo como **contraseña** cuando Git lo pida (usuario = tu usuario de GitHub).

## Opción B: Usar HTTPS en lugar de SSH

Si SSH no te funciona, cambia el remoto a HTTPS y haz push (GitHub puede abrir el navegador para iniciar sesión):

```bash
cd "C:\Users\alfon\proyectos\Mtra. Marta Camargo"
git remote set-url origin https://github.com/WeroMilk/raf_est.git
git push -u origin main
```

## Opción C: Script de PowerShell

Desde PowerShell, en la carpeta del proyecto:

```powershell
.\push-to-github.ps1
```

Cuando pida autenticación, introdúcela en la misma ventana.

---

**Resumen:** El commit local ya existe. Solo falta que ejecutes `git push -u origin main` en una terminal donde puedas escribir (o pegar) tu contraseña SSH o tu token de GitHub. Así se subirá todo a https://github.com/WeroMilk/raf_est
