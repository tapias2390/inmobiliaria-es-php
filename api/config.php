<?php
function loadEnv($path)
{
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
$langCode = getenv('LANGUAGE') ?: 'es';
$langMap = [
    'es' => '2',
    'en' => '1',
    'de' => '3',
    'fr' => '4',
    'nl' => '5',
    'da' => '6',
    'ru' => '7',
    'sv' => '8',
    'pl' => '9',
    'no' => '10',
    'tr' => '11',
    'fi' => '13',
    'hu' => '14',
];
$language = $langMap[$langCode] ?? '2';
$sandbox = getenv('SANDBOX') ?: 'false';

error_log("LANGUAGE from env: $langCode -> API lang: $language, SANDBOX: $sandbox");

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$filterId = isset($_GET['filter']) ? (int)$_GET['filter'] : 1;
$reference = isset($_GET['ref']) ? $_GET['ref'] : '';

$params = [
    'p_agency_filterid' => $filterId,
    'p1' => $agencyId,
    'p2' => $apiKey,
    'P_sandbox' => $sandbox,
    'p_lang' => $language,
];

// Parámetros de búsqueda adicionales
$searchParams = [
    'beds' => 'P_Beds',
    'baths' => 'P_Baths',
    'minPrice' => 'P_Min',
    'maxPrice' => 'P_Max',
    'location' => 'P_Location',
    'province' => 'P_Province',
    'propertyTypes' => 'P_PropertyTypes',
    'sortType' => 'P_SortType',
    'currency' => 'P_Currency',
    'energyRating' => 'P_EnergyRating',
    'newDevs' => 'p_new_devs',
    'images' => 'P_Images',
    'dimension' => 'P_Dimension',
    'builtMin' => 'P_Built_Min',
    'builtMax' => 'P_Built_Max',
    'plotMin' => 'P_Plot_Min',
    'plotMax' => 'P_Plot_Max',
    'rentalDateFrom' => 'P_RentalDateFrom',
    'rentalDateTo' => 'P_RentalDateTo',
    'includeRented' => 'P_IncludeRented',
    'decree218' => 'P_onlydecree218',
    'removeLocation' => 'P_RemoveLocation',
    'refId' => 'P_RefId',
];

foreach ($searchParams as $key => $apiParam) {
    if (isset($_GET[$key]) && $_GET[$key] !== '') {
        $params[$apiParam] = $_GET[$key];
    }
}

if (!empty($reference)) {
    $params['p_reference'] = $reference;
} else {
    $params['p_page'] = $page;
    $params['p_limit'] = $limit;
}

$params = http_build_query($params);

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
