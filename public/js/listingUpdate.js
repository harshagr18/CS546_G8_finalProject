(function ($) {
    $("#uiError").hide();
  })(jQuery);
  //form validation before submit
  
  const timeSlot = [
    00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    19, 20, 21, 22, 23, 24,
  ];
  
  function createParkingValidation(event) {
  
    const priceRegex = /^\d+$/;
  
    let startDate = $("#startDate").val();
    let endDate = $("#endDate").val();
    // let startTime = $("#startTime").find(":selected").text();
    let startTime = parseInt($("#startTime").val(), 10);
    // let endtTime = $("#endtTime").find(":selected").text();
    let endtTime = parseInt($("#endtTime").val(), 10);
    // let price = $("#price").val();
    let price = parseInt($("#price").val(), 10);
  
    if (
      !priceRegex.test(price) ||
      price < 0
    ) {
      event.preventDefault();
      $("#uiError").show();
      $("#uiError").html(
        "Price should only contain numbers more than 0"
      );
      return false;
    } else if ((endtTime - startTime) < 1) {
      event.preventDefault();
      $("#uiError").show();
      $("#uiError").html("Ending time id before the start time");
      return false;
    } 
    // else if () {
    //   event.preventDefault();
    //   $("#uiError").show();
    //   $("#uiError").html("State not found");
    //   return false;
    // }
    return true;
  }
  