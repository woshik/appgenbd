$(document).ready(function() {
    $("#message").fadeOut(0)
    var check = 1
    $("#installAppForm").unbind("submit").bind("submit", function(e) {
        e.preventDefault()
        var form = $(this)
        var url = form.attr("action")
        var type = form.attr("method")
        $.ajax({
            url: url,
            type: type,
            data: form.serialize(),
            dataType: "json",
            success: function(res) {
                $("#message").html('')
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
            }
        })
    })
})