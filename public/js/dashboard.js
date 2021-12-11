(function ($) {
  //error functions
  $("#uiError").hide();
})(jQuery);

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
