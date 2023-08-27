// var url_backend = "https://redgeodesica-cg.igac.gov.co";
// const URLAUTHS = "https://auth.homeristicodeath.tech:3001";



// $(function () {
//   $('[data-toggle="tooltip"]').tooltip()
// })

var popup;
$.getJSON("/json/popup.json", function (datos) {
  popup = datos.popup;
});


// $(document).ready(function () {
//   $("#example").DataTable({
//     scrollX: true,
//     searching: false,
//     paging: false,
//     info: false,
//   });

//   $("#example2").DataTable({
//     scrollX: true,
//     searching: false,
//     paging: false,
//     info: false,
//   });

//   $(".modalIntEstaciones").one("click", function () {
//     setTimeout(() => {
//       $("#example_wrapper .sorting").last().trigger("click");
//     }, 500);
//   });

//   $("#table_id").DataTable({
//     scrollX: true,
//     searching: false,
//     paging: false,
//     info: false,
//   });

//   $(".maestraModalRedes").one("click", function () {
//     setTimeout(() => {
//       $("#table_id_wrapper .sorting").last().trigger("click");
//     }, 500);
//   });

//   /*tabs*/

//   $(".bodyTarget2").hide();
//   $(".redActivaButton").on("click", function () {
//     $(this).addClass("active");
//     $(".redPasivaButton").removeClass("active");
//     $(".bodyTarget1").show();
//     $(".bodyTarget2").hide();
//   });
//   $(".redPasivaButton").on("click", function () {
//     $(this).addClass("active");
//     $(".redActivaButton").removeClass("active");
//     $(".bodyTarget2").show();
//     $(".bodyTarget1").hide();
//   });

//   /*ver mapa*/
//   $(".iframeMaps").hide();
//   $(".mapView").on("click", function () {
//     $(this).toggleClass("active");
//     if ($(".mapView").hasClass("active")) {
//       $(".iframeMaps").show();
//       $(".otraNovedadFoto").css("margin-top", "-150px");
//     } else {
//       $(".iframeMaps").hide();
//       $(".otraNovedadFoto").css("margin-top", "0");
//     }
//   });
// });
