COOLSTUFF V7 - SPOTIFY API READY

Archivos principales:
- index.html
- style.css
- app.js
- api/spotify-playlists.php
- api/spotify-config.php
- api/.htaccess
- api/cache/.gitkeep

Qué hace esta versión:
- Mantiene el diseño de la V6.
- Intenta cargar tus playlists directamente desde la API de Spotify.
- Si la API todavía no está configurada, usa la lista local de app.js como backup.
- Si cambiás nombre/foto/canciones de una playlist en Spotify, la página debería actualizarlo luego del cache.
- Si creás una playlist nueva pública en Spotify, debería aparecer al final automáticamente.

IMPORTANTE SOBRE EL VOLUMEN:
El volumen del reproductor embed de Spotify no se puede bajar desde HTML/CSS/JS normal.
El iframe pertenece a Spotify y no expone control de volumen para la página.

PASOS PARA ACTIVAR LA API EN HOSTINGER:

1) Entrá a Spotify Developer Dashboard:
   https://developer.spotify.com/dashboard

2) Creá una app nueva.
   Nombre sugerido: frack coolstuff
   Redirect URI: podés poner https://frack.one/coolstuff/
   Para esta versión con Client Credentials no vamos a usar login, pero Spotify suele pedir una Redirect URI igual.

3) Copiá:
   - Client ID
   - Client Secret

4) Abrí este archivo:
   api/spotify-config.php

5) Reemplazá:
   PONE_ACA_TU_CLIENT_ID
   PONE_ACA_TU_CLIENT_SECRET

6) Subí toda la carpeta coolstuff a tu hosting.
   Estructura recomendada:

   public_html/coolstuff/index.html
   public_html/coolstuff/style.css
   public_html/coolstuff/app.js
   public_html/coolstuff/api/spotify-playlists.php
   public_html/coolstuff/api/spotify-config.php
   public_html/coolstuff/api/.htaccess
   public_html/coolstuff/api/cache/.gitkeep

7) Probá abrir:
   https://frack.one/coolstuff/api/spotify-playlists.php

   Si está todo bien, deberías ver un JSON con tus playlists.
   Si ves spotify_credentials_not_configured, faltan las claves.
   Si ves spotify_api_error, pasame el texto del error y lo arreglamos.

8) Abrí:
   https://frack.one/coolstuff/

Cache:
- El endpoint guarda cache por 15 minutos.
- Para forzar refresco manual:
  https://frack.one/coolstuff/api/spotify-playlists.php?force=1

Orden:
- El orden actual está en CUSTOM_ORDER dentro de app.js.
- Las playlists nuevas que no estén en CUSTOM_ORDER aparecen al final.
