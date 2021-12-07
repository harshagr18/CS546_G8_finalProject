(function ($) {
  //error functions
  geoFindMe();
  document.querySelector("#find-me").addEventListener("click", geoFindMe);

  $("#uiError").hide();
  //edit parkings
  // $("#editParkings").click(function (e) {
  //   e.preventDefault();
  //   let parkingId = $("#parkingID").val();
  //   let requestConfig = {
  //     method: "PUT",
  //     url: window.location.href + "/" + parkingId,
  //   };
  //   $.ajax(requestConfig).then(function (response) {
  //     console.log(response);
  //   });
  // });

  //   $("#createParkings").click(function (e) {
  //     e.preventDefault();
  //     let requestConfig = {
  //       method: "GET",
  //       url: window.location.href + "/create",
  //     };
  //     $.ajax(requestConfig).then(function (response) {});
  //   });

  //   $("#btnMainSearch").click(function (e) {
  //     error.hide();
  //     e.preventDefault();
  //     let mainSearch = $("#mainSearch").val();
  //     if (mainSearch.trim().length === 0) {
  //       error.show();
  //       error.html("Search box cannot be empty");
  //     }
  //     let result = checkAlphanumerics(mainSearch);
  //     if (result) {
  //       error.show();
  //       error.html("Search only accepts alphanumeric");
  //     }
  //     let searchParams = new URLSearchParams(window.location.search);
  //     console.log(searchParams.has("mainSearch"));

  //     let requestConfig = {
  //       method: "GET",
  //       url: location.href,
  //     };
  //   });
  //
})(jQuery);

function geoFindMe() {
  const status = document.querySelector("#status");
  const mapLink = document.querySelector("#map-link");

  mapLink.href = "";
  mapLink.textContent = "";

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    status.textContent = "";
    mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
  }

  function error() {
    status.textContent = "Unable to retrieve your location";
  }

  if (!navigator.geolocation) {
    status.textContent = "Geolocation is not supported by your browser";
  } else {
    status.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

function checkAlphanumerics(phrase) {
  let str = phrase;
  const checker = /[^a-z0-9]/g;
  if (checker.test(str)) {
    return true;
  }

  return false;
}
//form validation before submit
function searchValidation(event) {
  let citysearch = $("#citySearch").val();
  let statesearch = $("#stateSearch").val();
  let zipsearch = $("#zipSearch").val();
  if (!citysearch && !statesearch && !zipsearch) {
    event.preventDefault();
    $("#uiError").show();
    $("#uiError").html("Search atleast by city, zipcode or state");
    return false;
  }
  return true;
}
