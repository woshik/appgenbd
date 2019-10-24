$(document).ready(function() {
    $("#message").fadeOut(0);

    $("#applicationGeneratorForm").unbind("submit").bind("submit", function(e) {
        e.preventDefault()
        var form = $(this)
        var url = form.attr("action")
        var type = form.attr("method")
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
                    form[0].reset()
                    $("#message").html('<div class="alert alert-success alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        res.message +
                        '</div>').fadeIn(1000)
                } else {
                    $("#message").html('<div class="alert alert-warning alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        res.message +
                        '</div>').fadeIn(1000)
                }
            }
        })
    })
})