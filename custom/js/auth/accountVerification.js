"use strict";

var timeOut;
$(document).ready(function() {
    $("#verificationForm").unbind("submit").bind("submit", function(e) {
        e.preventDefault();
        $("#message").fadeOut(0);
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
                if (res.success === true) {
                    window.location = res.url;
                } else {
                    $("#message").html('<div class="alert alert-warning alert-dismissible" role="alert">' + res.message + "</div>").fadeIn(1000);
                    clearMessage("message");
                }
            }
        });
        return false;
    });

    $('#mailSending').click(function(e) {
        $("#message").fadeOut(0);
        e.preventDefault();
        $.ajax({
            url: e.target.href,
            type: "POST",
            headers: {
                'CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            dataType: "json",
            success: function success(res) {
                if (res.url !== undefined) {
                    window.location = res.url;
                }

                $("#message").html('<div class="alert alert-info alert-dismissible" role="alert">' + res.message + "</div>").fadeIn(1000);
                clearMessage("message");
            }
        });
    });

    setTimeout(function() {
        $("#flashMessage").fadeOut(1000);
    }, 5000);
});

function clearMessage(id) {
    clearTimeout(timeOut);
    timeOut = setTimeout(function() {
        $("#" + id).fadeOut(1000);
    }, 5000);
}