$(document).ready(function() {
    $("#message").fadeOut(0);

    $("#appId").on('change', function() {
        var id = this.value
        if (id === "") {
            
            $("#message").html('<div class="alert alert-warning alert-dismissible" role="alert">' +
                '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                'Please, select an app name' +
                "</div>").fadeIn(1000)

            return;
        }

        $.ajax({
            url: '/sendmessagedate',
            type: 'GET',
            data: {
                appId: id
            },
            dataType: "json",
            success: function(res) {
                if (res.success === true) {
                    document.getElementById("messageDate").valueAsDate = new Date(res.date)
                } else {
                    $("#message").html('<div class="alert alert-warning alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        res.message +
                        "</div>").fadeIn(1000)
                }
            }
        });
    })

    $("#uploadContentForm").unbind("submit").bind("submit", function() {
        var form = $(this);
        var url = form.attr("action");
        var type = form.attr("method");
        $.ajax({
            url: url,
            type: type,
            data: form.serialize(),
            dataType: "json",
            success: function(res) {
                if (res.success === true) {
                    document.getElementById("messageDate").valueAsDate = new Date(res.date)
                    $('#messageContent').val('')
                } else {
                    $("#message").html('<div class="alert alert-warning alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        res.message +
                        '</div>').fadeIn(1000);
                }
            }
        });
        return false;
    });
});