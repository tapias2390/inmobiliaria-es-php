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

header('Content-Type: application/json; charset=utf-8');

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

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
$filterId = isset($_GET['filter']) ? (int)$_GET['filter'] : 1;
$reference = isset($_GET['ref']) ? $_GET['ref'] : '';

// Manejar RegisterLead
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'registerLead') {
    $leadParams = [
        'p_agency_filterid' => $filterId,
        'p1' => $agencyId,
        'p2' => $apiKey,
        'P_sandbox' => $sandbox,
        'P_Lang' => $language,
        'M1' => isset($_POST['name']) ? htmlspecialchars(trim($_POST['name'])) : '',
        'M2' => isset($_POST['surname']) ? htmlspecialchars(trim($_POST['surname'])) : '',
        'M5' => isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '',
        'M6' => 'Lead desde WB Realty',
        'M7' => isset($_POST['message']) ? htmlspecialchars(trim($_POST['message'])) : '',
        'RsId' => isset($_POST['ref']) ? htmlspecialchars(trim($_POST['ref'])) : '',
    ];

    if (!empty($_POST['phone'])) {
        $leadParams['M3'] = htmlspecialchars(trim($_POST['phone']));
    }

    // Validar campos obligatorios
    if (empty($leadParams['M1']) || empty($leadParams['M2']) || empty($leadParams['M5']) || empty($leadParams['M7'])) {
        echo json_encode(['success' => false, 'message' => 'Por favor, completa todos los campos obligatorios.']);
        exit;
    }

    if (!filter_var($leadParams['M5'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Por favor, ingresa un email válido.']);
        exit;
    }

    $leadUrl = "$apiBaseUrl/RegisterLead?" . http_build_query($leadParams);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $leadUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        echo json_encode(['success' => false, 'message' => 'Error de conexión. Inténtalo de nuevo.']);
        exit;
    }

    if (strpos($response, 'successfully') !== false) {
        echo json_encode(['success' => true, 'message' => '¡Mensaje enviado correctamente!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al enviar el mensaje. Inténtalo de nuevo.']);
    }
    exit;
}

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
    $params['P_RefId'] = $reference;
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
