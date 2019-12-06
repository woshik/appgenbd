var timeOut, userList
$( "#message" ).fadeOut( 0 )

function applicationSetting() {
	$( "#appSettingButton" ).unbind( "click" ).bind( "click", function () {
		$( "#app-setting-error-message" ).fadeOut( 0 )
		$.ajax( {
			url: "<%=appSetting%>",
			type: "POST",
			headers: {
				'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
			},
			data: {
				'id': $( '#appSettingId' ).val(),
				'maxAppInstall': $( "#maxAppInstall" ).val(),
				'costPerMonth': $( "#costPerMonth" ).val(),
			},
			dataType: "json",
			success: function ( res ) {
				if ( res.success === true ) {
					$( "#app-setting-error-message" ).html( '<div class="alert alert-success alert-dismissible" role="alert">' +
						'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
						res.message + '</div>' ).fadeIn( 1000 )
				} else {
					$( "#app-setting-error-message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' +
						'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + res.message + '</div>' ).fadeIn( 1000 )
				}

				clearMessage( "app-setting-error-message" )
			}
		} )
	} )
}

function profileSetting() {
	$( "#profileSettingButton" ).unbind( "click" ).bind( "click", function () {
		$( "#profile-setting-error-message" ).fadeOut( 0 )
		$.ajax( {
			url: "<%=profileSetting%>",
			type: "POST",
			headers: {
				'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
			},
			data: {
				'email': $( "#adminEmail" ).val(),
				'password': $( "#adminPassword" ).val(),
				'confirm_password': $( "#adminConfirmPassword" ).val()
			},
			dataType: "json",
			success: function ( res ) {
				if ( res.success === true ) {
					$( "#profile-setting-error-message" ).html( '<div class="alert alert-success alert-dismissible" role="alert">' +
						'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
						res.message + '</div>' ).fadeIn( 1000 )
					$( "#adminPassword" ).val( '' )
					$( "#adminConfirmPassword" ).val( '' )
				} else {
					$( "#profile-setting-error-message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' +
						'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + res.message + '</div>' ).fadeIn( 1000 )
				}

				clearMessage( "profile-setting-error-message" )
			}
		} )
	} )
}

function clearMessage( idName ) {
	clearTimeout( timeOut )
	timeOut = setTimeout( function () {
		$( "#" + idName ).fadeOut( 1000 )
	}, 5000 )
}
