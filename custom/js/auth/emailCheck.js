$(document).ready(function() {
    let timeOut
    $("#verificationForm").unbind("submit").bind("submit", function(e) {
        e.preventDefault()
        $("#message").fadeOut(0)
        var form = $(this)
        var url = form.attr("action")
        var type = form.attr("method")
        $.ajax({
            url: url,
            type: type,
            data: form.serialize(),
            dataType: "json",
            success: function(res) {
                if (res.success === true) {
                    window.location = res.message
                } else {
                    clearTimeout(timeOut)
                    $("#message").html('<div class="alert alert-warning alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        res.message +
                        "</div>"
                    ).fadeIn(1000)
                    timeOut = setTimeout(function() {
                        $("#message").fadeOut(1000)
                    }, 5000)
                }
            }
        })
        return false
    })

    $('#mailSending').click(function(e) {
        $("#message").fadeOut(0)
        e.preventDefault()
        $.ajax({
            url: e.target.href,
            type: "POST",
            data: {
                _csrf: $("#csrf")[0].value
            },
            dataType: "json",
            success: function(res) {
                clearTimeout(timeOut)
                if (res.url !== undefined) {
                    window.location = res.url
                }
                $("#message").html('<div class="alert alert-info alert-dismissible" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    res.message +
                    "</div>"
                ).fadeIn(1000)
                timeOut = setTimeout(function() {
                    $("#message").fadeOut(1000)
                }, 5000)
            }
        })
    })
})