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

// Endpoint para cambiar idioma
if (isset($_GET['action']) && $_GET['action'] === 'setLanguage') {
    $newLang = isset($_GET['lang']) ? $_GET['lang'] : 'es';
    $validLangs = ['es', 'en', 'de', 'fr', 'nl', 'it', 'pt', 'da', 'ru', 'sv', 'pl', 'no', 'tr', 'fi', 'hu'];
    if (!in_array($newLang, $validLangs)) {
        $newLang = 'es';
    }
    // Establecer cookie con más atributos para compatibilidad
    setcookie('site_lang', $newLang, [
        'expires' => time() + (86400 * 30),
        'path' => '/',
        'secure' => false,
        'samesite' => 'Lax'
    ]);
    echo json_encode(['success' => true, 'language' => $newLang]);
    exit;
}

// Obtener idioma de cookie o .env
$langCode = isset($_COOKIE['site_lang']) ? $_COOKIE['site_lang'] : (getenv('LANGUAGE') ?: 'es');

$apiBaseUrl = getenv('API_BASE_URL') ?: 'https://webapi.resales-online.com/V6';
$apiKey = getenv('API_KEY');
$agencyId = getenv('AGENCY_ID');
$filterId = getenv('FILTER_ID') ?: '1';
$langMap = [
    'es' => '2',
    'en' => '1',
    'de' => '3',
    'fr' => '4',
    'nl' => '5',
    'it' => '12',
    'pt' => '15',
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

// Permitir override por query param: ?sandbox=true|false
if (isset($_GET['sandbox']) && $_GET['sandbox'] !== '') {
    $sandbox = $_GET['sandbox'];
}

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 40;
$page = $page > 0 ? $page : 1;
$limit = $limit > 0 ? $limit : 30;
$limit = min(30, $limit);
$filterId = isset($_GET['filter']) ? (int)$_GET['filter'] : 1;
$reference = isset($_GET['ref']) ? $_GET['ref'] : '';

// Acciones auxiliares (para llenar filtros dinámicos en el frontend)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
    $action = $_GET['action'];

    $baseParams = [
        'p_agency_filterid' => $filterId,
        'p1' => $agencyId,
        'p2' => $apiKey,
        'P_sandbox' => $sandbox,
        'p_lang' => $language,
    ];

    if ($action === 'locations') {
        $pAll = isset($_GET['all']) ? $_GET['all'] : '';
        if ($pAll !== '') {
            $baseParams['P_All'] = $pAll;
        }
        $sortType = isset($_GET['sortType']) ? $_GET['sortType'] : '';
        if ($sortType !== '') {
            $baseParams['P_SortType'] = $sortType;
        }

        $u = "$apiBaseUrl/SearchLocations?" . http_build_query($baseParams);
    } elseif ($action === 'provinces') {
        $u = "$apiBaseUrl/Provinces?" . http_build_query($baseParams);
    } elseif ($action === 'propertyTypes') {
        $u = "$apiBaseUrl/SearchPropertyTypes?" . http_build_query($baseParams);
    } elseif ($action === 'features') {
        $u = "$apiBaseUrl/SearchFeatures?" . http_build_query($baseParams);
    } elseif ($action === 'bookingCalendar') {
        $refId = isset($_GET['ref']) ? $_GET['ref'] : '';
        $startDate = isset($_GET['start']) ? $_GET['start'] : '';
        $endDate = isset($_GET['end']) ? $_GET['end'] : '';

        if (empty($refId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Ref ID requerido']);
            exit;
        }

        $baseParams['P_RefId'] = $refId;
        if (!empty($startDate)) {
            $baseParams['P_StartDate'] = $startDate;
        }
        if (!empty($endDate)) {
            $baseParams['P_EndDate'] = $endDate;
        }

        $u = "$apiBaseUrl/BookingCalendar?" . http_build_query($baseParams);
    } elseif ($action === 'promociones') {
        // Promociones: buscar en varias páginas para obtener todas las promociones
        $allProperties = [];
        $seenRefs = [];
        $pageUrls = [];
        $maxPages = isset($_GET['maxPages']) ? intval($_GET['maxPages']) : 10; // Por defecto 10 páginas
        $zona = isset($_GET['zona']) ? $_GET['zona'] : ''; // Filtrar por zona si se especifica

        for ($page = 1; $page <= $maxPages; $page++) {
            $pageParams = $baseParams;
            $pageParams['searchfromdevelopments'] = '1';
            $pageParams['newdevaccess'] = '2';
            $pageParams['P_SortType'] = isset($_GET['sortType']) ? $_GET['sortType'] : '2';
            $pageParams['P_PageSize'] = '40';
            $pageParams['P_Page'] = $page;

            // Agregar filtro de zona si se especifica
            if ($zona) {
                $pageParams['P_Location'] = $zona;
            }

            $pageUrl = "$apiBaseUrl/SearchProperties?" . http_build_query($pageParams);
            $pageUrls[] = $pageUrl;
            error_log("Promociones página $page: " . $pageUrl);

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $pageUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_SSL_VERIFYPEER => true
            ]);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $response) {
                $data = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE && !empty($data['Property'])) {
                    // Agregar solo propiedades únicas por referencia
                    foreach ($data['Property'] as $prop) {
                        $ref = $prop['Reference'] ?? '';
                        if ($ref && !isset($seenRefs[$ref])) {
                            $allProperties[] = $prop;
                            $seenRefs[$ref] = true;
                        }
                    }
                    // Guardar el PropertyCount total
                    if ($page === 1 && isset($data['QueryInfo']['PropertyCount'])) {
                        $totalCount = $data['QueryInfo']['PropertyCount'];
                    }
                }
            }
        }

        // Devolver resultado consolidado
        header('Content-Type: application/json');
        echo json_encode([
            'QueryInfo' => [
                'PropertyCount' => $totalCount ?? count($allProperties),
                'CurrentPage' => 1,
                'PropertiesPerPage' => 40
            ],
            'Property' => $allProperties,
            '_debug' => [
                'pagesFetched' => $maxPages,
                'totalUnique' => count($allProperties),
                'pageUrls' => $pageUrls
            ]
        ]);
        exit;
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Acción no válida']);
        exit;
    }

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $u,
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
        // A veces el API devuelve HTML u otro contenido en errores.
        // Envolver para que el frontend pueda diagnosticar sin romper JSON.parse.
        echo json_encode([
            'error' => 'Upstream API error',
            'status' => $httpCode,
            'upstream' => $response,
            'url' => $u,
        ]);
        exit;
    }

    echo $response;
    exit;
}

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
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_SSL_VERIFYPEER => false
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        http_response_code(502);
        echo json_encode([
            'success' => false,
            'message' => 'Error de conexión. Inténtalo de nuevo.',
            'curl_error' => $error,
            'status' => $httpCode,
            'url' => $leadUrl,
        ]);
        exit;
    }

    if ($httpCode !== 200) {
        http_response_code($httpCode);
        echo json_encode([
            'success' => false,
            'message' => 'Error al enviar el mensaje. Inténtalo de nuevo.',
            'status' => $httpCode,
            'upstream' => $response,
            'url' => $leadUrl,
        ]);
        exit;
    }

    $resp = trim((string)$response);
    $lower = strtolower($resp);
    // Detectar éxito: la API puede devolver en español o inglés
    $ok = (strpos($lower, 'successfully') !== false)
        || (strpos($lower, 'forwarded') !== false)
        || (strpos($lower, 'remitida') !== false)
        || (strpos($lower, 'contact') !== false);

    if ($ok) {
        echo json_encode(['success' => true, 'message' => '¡Mensaje enviado correctamente!']);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al enviar el mensaje. Inténtalo de nuevo.',
            'upstream' => $resp,
        ]);
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
    'newDevs' => 'P_New_Devs',
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
    // 'address', 'development', 'searchtext' se filtran localmente en el frontend
];

foreach ($searchParams as $key => $apiParam) {
    if (isset($_GET[$key]) && $_GET[$key] !== '') {
        $val = $_GET[$key];
        // Convertir newDevs=1 o "on" a "include" para el API de Resales Online
        if ($key === 'newDevs' && ($val === '1' || $val === 'on')) {
            $params[$apiParam] = 'include';
        } else {
            $params[$apiParam] = $val;
        }
    }
}

// Features: Debe tener / Preferible tener (ParamName separados por coma)
foreach (['featuresMust', 'featuresPrefer'] as $featuresKey) {
    if (!isset($_GET[$featuresKey]) || $_GET[$featuresKey] === '') continue;
    $raw = (string)$_GET[$featuresKey];
    $parts = array_filter(array_map('trim', explode(',', $raw)));

    foreach ($parts as $paramName) {
        // Seguridad: solo permitir nombres tipo "1Setting1" "2Pool3" (alfa-numérico)
        if (!preg_match('/^[A-Za-z0-9_]+$/', $paramName)) continue;
        $params[$paramName] = '1';
    }
}

if (!empty($reference)) {
    $params['P_RefId'] = $reference;

    // Permitir encontrar referencias que pertenezcan a desarrollos / nueva promoción
    // (sin esto, algunas referencias de promociones no aparecen en el filtro estándar)
    $params['searchfromdevelopments'] = '1';
    $params['newdevaccess'] = '2';

    // Para búsquedas por referencia, intentar primero producción y si no encuentra,
    // reintentar con sandbox (muchas referencias existen en un entorno pero no en otro)
    $result = null;
    $entornos = ['false', 'true']; // primero producción, luego sandbox

    foreach ($entornos as $entorno) {
        $testParams = $params;
        $testParams['P_sandbox'] = $entorno;
        $url = "$apiBaseUrl/SearchProperties?" . http_build_query($testParams);

        error_log("Buscando referencia con sandbox=$entorno: " . $url);

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

        error_log("Respuesta sandbox=$entorno: HTTP $httpCode, Error: $error");

        if ($httpCode === 200 && $response) {
            $data = json_decode($response, true);
            $count = $data['QueryInfo']['PropertyCount'] ?? 0;
            error_log("PropertyCount con sandbox=$entorno: $count");
            if (!empty($data['Property'])) {
                $result = $response;
                error_log("¡Encontrado con sandbox=$entorno!");
                break;
            }
        }
    }

    if ($result) {
        echo $result;
        exit;
    } else {
        // Debug: devolver info de qué se intentó
        echo json_encode([
            'QueryInfo' => ['PropertyCount' => 0],
            'Property' => [],
            '_debug' => [
                'reference' => $reference,
                'message' => 'No se encontró en ningún entorno'
            ]
        ]);
        exit;
    }
} else {
    $params['P_PageNo'] = $page;
    $params['P_PageSize'] = $limit;
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
