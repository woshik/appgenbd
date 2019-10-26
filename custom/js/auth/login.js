$(document).ready(function() {
    let timeOut
    $("#loginForm").unbind("submit").bind("submit", function(e) {
        e.preventDefault()
        var form = $(this)
        var url = form.attr("action")
        var type = form.attr("method")

        $("#message").fadeOut(0)
        $.ajax({
            url: url,
            type: type,
            headers: {
                'CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
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
                        '</div>').fadeIn(1000)
                    timeOut = setTimeout(function() {
                        $("#message").fadeOut(500)
                    }, 5000)
                }
            }
        })
    })
})