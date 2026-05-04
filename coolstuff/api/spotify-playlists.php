<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

$configPath = __DIR__ . '/spotify-config.php';

if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'missing_config']);
    exit;
}

$config = require $configPath;

$clientId = trim($config['client_id'] ?? '');
$clientSecret = trim($config['client_secret'] ?? '');
$userId = trim($config['spotify_user_id'] ?? 'franalbertario');
$onlyOwner = (bool)($config['only_owner'] ?? true);
$cacheSeconds = (int)($config['cache_seconds'] ?? 900);

if (
    $clientId === '' ||
    $clientSecret === '' ||
    str_contains($clientId, 'PONE_ACA') ||
    str_contains($clientSecret, 'PONE_ACA')
) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'spotify_credentials_not_configured']);
    exit;
}

$cacheDir = __DIR__ . '/cache';
$cacheFile = $cacheDir . '/playlists.json';
$forceRefresh = isset($_GET['force']) && $_GET['force'] === '1';

if (!$forceRefresh && file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheSeconds)) {
    $cached = file_get_contents($cacheFile);
    if ($cached !== false && $cached !== '') {
        echo $cached;
        exit;
    }
}

function http_request_json(string $url, array $options = []): array
{
    $ch = curl_init($url);
    if ($ch === false) {
        throw new Exception('Could not initialize cURL');
    }

    $headers = $options['headers'] ?? [];
    $method = $options['method'] ?? 'GET';
    $body = $options['body'] ?? null;

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 14,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_USERAGENT => 'frack.one coolstuff spotify api',
    ]);

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($raw === false || $status < 200 || $status >= 300) {
        throw new Exception('HTTP request failed. Status: ' . $status . ' Error: ' . $error . ' Body: ' . substr((string)$raw, 0, 280));
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        throw new Exception('Invalid JSON response');
    }

    return $decoded;
}

function get_spotify_access_token(string $clientId, string $clientSecret): string
{
    $auth = base64_encode($clientId . ':' . $clientSecret);

    $response = http_request_json('https://accounts.spotify.com/api/token', [
        'method' => 'POST',
        'headers' => [
            'Authorization: Basic ' . $auth,
            'Content-Type: application/x-www-form-urlencoded',
        ],
        'body' => 'grant_type=client_credentials',
    ]);

    if (empty($response['access_token'])) {
        throw new Exception('No access token returned by Spotify');
    }

    return $response['access_token'];
}

function normalize_playlist(array $item): array
{
    $images = $item['images'] ?? [];
    $cover = '';

    if (is_array($images) && count($images) > 0 && !empty($images[0]['url'])) {
        $cover = $images[0]['url'];
    }

    return [
        'id' => $item['id'] ?? '',
        'title' => $item['name'] ?? 'untitled',
        'cover' => $cover,
        'url' => $item['external_urls']['spotify'] ?? '',
        'owner_id' => $item['owner']['id'] ?? '',
    ];
}

try {
    if (!function_exists('curl_init')) {
        throw new Exception('PHP cURL extension is not enabled on this server');
    }

    $token = get_spotify_access_token($clientId, $clientSecret);
    $playlists = [];
    $offset = 0;
    $limit = 50;
    $total = null;

    do {
        $url = 'https://api.spotify.com/v1/users/' . rawurlencode($userId) . '/playlists?limit=' . $limit . '&offset=' . $offset;
        $page = http_request_json($url, [
            'headers' => ['Authorization: Bearer ' . $token],
        ]);

        $items = $page['items'] ?? [];
        $total = isset($page['total']) ? (int)$page['total'] : null;

        foreach ($items as $item) {
            $playlist = normalize_playlist($item);

            if ($playlist['id'] === '' || $playlist['cover'] === '') {
                continue;
            }

            if ($onlyOwner && $playlist['owner_id'] !== $userId) {
                continue;
            }

            unset($playlist['owner_id']);
            $playlists[] = $playlist;
        }

        $offset += $limit;
    } while ($total !== null && $offset < $total);

    $payload = [
        'ok' => true,
        'source' => 'spotify_api',
        'updated_at' => gmdate('c'),
        'total' => count($playlists),
        'playlists' => $playlists,
    ];

    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0755, true);
    }

    if (is_dir($cacheDir) && is_writable($cacheDir)) {
        @file_put_contents($cacheFile, $json);
    }

    echo $json;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'spotify_api_error',
        'message' => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
