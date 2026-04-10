<?php
function loadEnv($path) {
    if (!file_exists($path)) return;
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        
        if (!array_key_exists($key, $_ENV)) {
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

loadEnv(__DIR__ . '/../.env');

header('Content-Type: application/json');

$apiBaseUrl = getenv('API_BASE_URL') ?: 'https://webapi.resales-online.com/V6';
$apiKey = getenv('API_KEY');
$agencyId = getenv('AGENCY_ID');
$filterId = getenv('FILTER_ID') ?: '1';
$language = getenv('LANGUAGE') ?: 'es';
$sandbox = getenv('SANDBOX') ?: 'true';

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

$params = http_build_query([
    'p_agency_filterid' => $filterId,
    'p1' => $agencyId,
    'p2' => $apiKey,
    'P_sandbox' => $sandbox,
    'p_lang' => $language,
    'p_page' => $page,
    'p_limit' => $limit
]);

$url = "$apiBaseUrl/SearchProperties?$params";

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(['error' => $error]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo $response;
    exit;
}

echo $response;
