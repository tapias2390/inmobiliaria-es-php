const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    toggle.classList.toggle("active");
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get("ref");
  const filter = urlParams.get("filter") || "1";

  if (!reference) {
    window.location.href = "index.php";
    return;
  }

  const model = new PropertyModel(CONFIG);
  const detailView = new PropertyDetailView("property-detail-container");

  detailView.renderLoading();

  try {
    const property = await model.fetchPropertyByReference(reference, filter);
    /*console.log("[PropertyDetail] property:", property);
    try {
      console.log(
        "[PropertyDetail] property (json):",
        JSON.stringify(property, null, 2),
      );
    } catch (e) {
      // ignore stringify errors
    }*/

    let dateRanges = null;
    if (property.rentalPeriod && property.rentalPeriod !== "") {
      try {
        const today = new Date();
        const nextYear = new Date(
          today.getFullYear() + 1,
          today.getMonth(),
          today.getDate(),
        );
        const startStr = today.toISOString().split("T")[0];
        const endStr = nextYear.toISOString().split("T")[0];
        dateRanges = await model.fetchBookingCalendar(
          property.reference,
          startStr,
          endStr,
        );
      } catch (e) {
        console.warn("No se pudo cargar disponibilidad:", e);
      }
    }

    detailView.render(property, dateRanges);
  } catch (error) {
    console.error("Error loading property:", error);
    detailView.renderError("Error al cargar la propiedad");
  }
});
