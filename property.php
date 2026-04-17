<!doctype html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Detalle de Propiedad - WB Realty</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap"
    rel="stylesheet" />
  <link rel="stylesheet" href="css/styles.css" />
  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBOl2lQivaauMAu-gpUI_-fCekiBaWyAxY&libraries=places" async defer></script>
</head>

<body>
  <?php include 'partials/header.php'; ?>

  <!-- BODY -->
  <main class="main">
    <div class="container">
      <section class="property-detail-section">
        <div id="property-detail-container"></div>
      </section>
    </div>
  </main>

  <?php include 'partials/footer.php'; ?>

  <script src="js/config.js"></script>
  <script src="js/models/PropertyModel.js"></script>
  <script src="js/views/PropertyDetailView.js"></script>
  <script src="js/app-detail.js"></script>
</body>

</html>