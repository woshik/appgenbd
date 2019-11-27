"use strict";

$(document).ready(function () {
  var timeOut;
  $("#error-message").fadeOut(0);
  $("#uploadContentForm").unbind("submit").bind("submit", function (e) {
    e.preventDefault();
    var form = $(this);
    var url = form.attr("action");
    var type = form.attr("method");
    $.ajax({
      url: url,
      type: type,
      headers: {
        'CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      data: form.serialize(),
      dataType: "json",
      success: function success(res) {
        if (res.length) {
          res.forEach(function (alert) {
            if (alert.success) {
              $("#card-" + alert.position).remove();
            } else {
              $("#card-" + alert.position).css('border', '3px red solid');
              $("#message-" + alert.position).html('<div class="alert alert-warning alert-dismissible" role="alert">' + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + alert.message + '</div>').fadeIn(1000);
            }
          });
        } else {
          $("#error-message").html('<div class="alert alert-danger alert-dismissible" role="alert">' + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + res.message + '</div>').fadeIn(1000);
          clearTimeout(timeOut);
          timeOut = setTimeout(function () {
            $("#error-message").fadeOut(1000);
          }, 5000);
        }
      }
    });
  });
});