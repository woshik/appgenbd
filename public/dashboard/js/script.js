$(document).ready(function() {
    $.easing.def = "easeOutBounce";

    $('li.button a').click(function(e) {
        var dropDown = $(this).parent().next();
        $('.dropdown').not(dropDown).slideUp('slow');
        dropDown.slideToggle('slow');
        e.preventDefault();
    })

    $('#sidebarCollapse').on('click', function() {
        $('#sidebar').toggleClass('active');
    });

    $(".dropdown").hover(
        function() {
            $('.profile-dropdown-menu', this).stop(true, true).slideDown("fast")
            $(this).toggleClass('open')
        },
        function() {
            $('.profile-dropdown-menu', this).stop(true, true).slideUp("fast")
            $(this).toggleClass('open')
        }
    )

    var timeOut;
    $("#userProfileSettingBtn").unbind("click").bind("click", function() {
        $("#user-profile-setting-error-message").fadeOut(0)
        $.ajax({
            url: "/userprofilesetting",
            type: "POST",
            headers: {
                'CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            data: {
                'name': $("#userProfileSettingName").val(),
                'current_password': $('#userProfileSettingCurrentPass').val(),
                'password': $("#userProfileSettingPass").val(),
                'confirm_password': $("#userProfileSettingConfirmPass").val()
            },
            dataType: "json",
            success: function(res) {
                if (res.success === true) {
                    $("#user-profile-setting-error-message").html('<div class="alert alert-success alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        res.message + '</div>').fadeIn(1000)
                    $("#userProfileSettingCurrentPass").val('')
                    $("#userProfileSettingPass").val('')
                    $("#userProfileSettingConfirmPass").val('')
                } else {
                    $("#user-profile-setting-error-message").html('<div class="alert alert-warning alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + res.message + '</div>').fadeIn(1000)
                }

                clearTimeout(timeOut)
                timeOut = setTimeout(function() {
                    $("#user-profile-setting-error-message").fadeOut(1000)
                }, 5000)
            }
        })
    })
});