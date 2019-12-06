var timeOut, appList;
$( document ).ready( function () {
	$( "app-list-message" ).fadeOut( 0 )
	var form = $( "#appListForm" )
	appList = $( '#appList' ).DataTable( {
		"processing": true,
		"serverSide": true,
		"order": [],
		"ajax": {
			url: form.attr( "action" ),
			headers: {
				'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
			},
			type: form.attr( "method" )
		},
		"columnDefs": [ {
			"targets": [ 6 ],
			"orderable": false
    } ],
		"lengthMenu": [
        [ 5, 10, 25, 50, 75, 100, 200 ],
        [ 5, 10, 25, 50, 75, 100, 200 ]
    ],
	} )
	setTimeout( function () {
		$( "#flashMessage" ).fadeOut( 1000 )
	}, 5000 )
} )

function appInfoUpdate( AppName ) {
	if ( AppName ) {
		$( "#updateAppInfoBtn" ).unbind( "click" ).bind( "click", function () {
			$( "#update-app-info-message" ).fadeOut( 0 );
			$.ajax( {
				url: "<%=appInfoUpdateUrl%>",
				type: "POST",
				headers: {
					'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
				},
				data: {
					'appId': $( "#updateAppInfoId" ).val(),
					'password': $( "#updateAppInfoPassword" ).val(),
					'appName': AppName,
				},
				dataType: "json",
				success: function ( res ) {
					if ( res.success === true ) {
						$( "#app-list-message" ).html( '<div class="alert alert-success alert-dismissible" role="alert">' +
							'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + res.message + '</div>' ).fadeIn( 1000 )
						$( '#updateAppInfo' ).modal( 'hide' )
						appList.ajax.reload( null, false );
						clearMessage( 'app-list-message' )
					} else {
						$( "#update-app-info-message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' +
							'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + res.message + '</div>' ).fadeIn( 1000 )
					}
					clearMessage( 'update-app-info-message' )
				}
			} )
		} )
	}
}

function appStatusChange( AppName ) {
	if ( AppName ) {
		$( "#app-status-change-message" ).fadeOut( 0 );
		$.ajax( {
			url: "<%=appStatusChangeUrl%>",
			type: "GET",
			headers: {
				'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
			},
			data: {
				'appName': AppName,
			},
			dataType: "json",
			success: function ( res ) {
				if ( res.success === true ) {
					document.getElementById( "appStatusChangeModalLabel" ).innerHTML = res.appActive ? "App Deactivation" : "App Activation"
					document.getElementById( "appStatusChangeModalBody" ).innerHTML = "Do you want to really " + ( res.appActive ? "deactivate" : "activate" ) + " your app?"
					document.getElementById( "appStatusChangeButton" ).innerHTML = res.appActive ? "Turn off" : "Turn on"
					$( "#appStatusChangeButton" ).unbind( 'click' ).bind( 'click', function () {
						$.ajax( {
							url: "<%=appStatusChangeUrl%>",
							type: "POST",
							headers: {
								'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
							},
							data: {
								'appName': AppName,
							},
							dataType: "json",
							success: function ( res ) {
								if ( res.success === true ) {
									$( "#app-list-message" ).html( '<div class="alert alert-success alert-dismissible" role="alert">' +
										'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + res.message + '</div>' ).fadeIn( 1000 )
									$( '#appStatusChange' ).modal( 'hide' )
									appList.ajax.reload( null, false )
									clearMessage( 'app-list-message' )
								} else {
									$( "#app-status-change-message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' +
										'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + res.message + '</div>' ).fadeIn( 1000 )
								}
							}
						} )
					} )
				} else {
					$( "#app-status-change-message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' +
						'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + res.message + '</div>' ).fadeIn( 1000 )
				}
				clearMessage( 'app-status-change-message' )
			}
		} )
	}
}

function clearMessage( idName ) {
	clearTimeout( timeOut )
	timeOut = setTimeout( function () {
		$( "#" + idName ).fadeOut( 1000 )
	}, 5000 )
}
