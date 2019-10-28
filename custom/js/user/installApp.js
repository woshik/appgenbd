$(document).ready(function() {
    var check = 1,
        timeOut
    $("#installAppForm").unbind("submit").bind("submit", function(e) {
        $("#message").fadeOut(0)
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
                    if (check === 1) {
                        $('#smsUrl').val(res.message.sms)
                        $('#ussdUrl').val(res.message.ussd)
                        $('#sectionHidden').slideDown()
                        $("#installAppForm").attr("action", res.message.url)
                        $("#appName").attr('readonly', 'readonly')
                        check++;
                    } else {
                        $('#sectionHidden').slideUp()
                        $("#installAppForm")[0].reset()
                        $("#appName").removeAttr('readonly', 'readonly')
                        $("#installAppForm").attr("action", res.message.url)
                        $("#message").html('<div class="alert alert-success alert-dismissible" role="alert">' +
                            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                            res.message.msg +
                            '</div>').fadeIn(1000);
                        check = 1;
                    }
                } else {
                    $("#message").html('<div class="alert alert-warning alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        res.message +
                        '</div>').fadeIn(1000)
                }
                clearTimeout(timeOut)
                timeOut = setTimeout(function() {
                    $("#message").fadeOut(1000)
                }, 5000)
            }
        })
    })
})