FRAN - QUÉ HICE EN ESTA VERSIÓN

Esta versión deja la API de Spotify bien preparada para GitHub público:

1) NO incluye spotify-config.php con claves reales.
2) Incluye coolstuff/api/spotify-config.example.php como plantilla segura.
3) Agrega .gitignore para que coolstuff/api/spotify-config.php no se suba nunca más a GitHub.
4) Agrega .htaccess para bloquear archivos de config desde navegador en Hostinger.
5) Mantiene spotify-playlists.php funcionando igual, pero esperando el config privado.

PASOS EXACTOS

1) MUY IMPORTANTE: entrá al Spotify Developer Dashboard y regenerá el Client Secret.
   El anterior ya quedó expuesto en GitHub, así que no lo uses más.

2) En tu repo local, pegá/reemplazá estos archivos:
   - .gitignore en la raíz del repo
   - coolstuff/api/spotify-playlists.php
   - coolstuff/api/spotify-config.example.php
   - coolstuff/api/.htaccess

3) Borrá del repo el archivo real:
   coolstuff/api/spotify-config.php

   En Git:
   git rm --cached coolstuff/api/spotify-config.php

   Si también querés borrarlo de tu carpeta local:
   rm coolstuff/api/spotify-config.php

4) Commit y push:
   git add .gitignore coolstuff/api/spotify-playlists.php coolstuff/api/spotify-config.example.php coolstuff/api/.htaccess
   git commit -m "Secure Spotify API config"
   git push

5) En Hostinger, creá manualmente este archivo:
   public_html/coolstuff/api/spotify-config.php

   Copiá el contenido de spotify-config.example.php, pero reemplazá:
   - PONE_ACA_TU_CLIENT_ID_NUEVO
   - PONE_ACA_TU_CLIENT_SECRET_NUEVO

6) Probá en el navegador:
   https://frack.one/coolstuff/api/spotify-playlists.php?force=1

   Si está bien, tiene que devolver JSON con:
   "ok": true
   "source": "spotify_api"
   "playlists": [...]

NOTA

No puedo dejarte el secret real dentro del archivo porque si lo subís otra vez a GitHub queda expuesto de nuevo.
La clave real va solamente en Hostinger, no en el repositorio.
