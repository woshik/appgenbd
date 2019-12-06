$( document ).ready( function () {
	userList = $( '#userList' ).DataTable( {
		"processing": true,
		"serverSide": true,
		"order": [],
		"ajax": {
			url: "<%=userList%>",
			headers: {
				'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
			},
			type: "POST"
		},
		"columnDefs": [ {
			"targets": [ 0, 1, 2, 3, 4 ],
			"orderable": false
        } ],
		"lengthMenu": [
            [ 5, 10, 25, 50, 75, 100, -1 ],
            [ 5, 10, 25, 50, 75, 100, "All" ]
        ],
	} )
} )


function payment( id ) {
	if ( id ) {
		$( "#userMaxApp" ).val( '' )
		$( "#ammount" ).val( '' )
		$.ajax( {
			url: "<%=maxAppInstallUrl%>",
			type: "GET",
			data: {
				'id': id,
			},
			dataType: "json",
			success: function ( res ) {
				$( "#paymentError" ).fadeOut( 0 )
				if ( res.success ) {
					$( "#userMaxApp" ).val( res.maxApp )
					$( "#paymentButton" ).unbind( "click" ).bind( "click", function () {
						$( "#paymentError" ).fadeOut( 0 )
						$.ajax( {
							url: "<%=userPayment%>",
							type: "POST",
							headers: {
								'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
							},
							data: {
								'id': id,
								'userMaxApp': $( "#userMaxApp" ).val(),
								'ammount': $( "#ammount" ).val(),
							},
							dataType: "json",
							success: function ( res ) {
								if ( res.success ) {
									$( "#paymentError" ).html( '<div class="alert alert-success alert-dismissible" role="alert">' +
										'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
										res.message +
										'</div>' ).fadeIn( 1000 )
									userList.ajax.reload( null, false );
								} else {
									$( "#paymentError" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' +
										'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
										res.message +
										'</div>' ).fadeIn( 1000 )
								}

								clearMessage( "paymentError" )
							}
						} )
					} )
				} else {
					$( "#paymentError" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' +
						'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
						res.message + '</div>' ).fadeIn( 1000 )
				}

				clearMessage( "paymentError" )
			}
		} )
	}
}

function accountStatusChange( id, accountStatus ) {
	var accountStatusChangeText = accountStatus === 'true' ? "Deactive" : "Active"
	document.getElementById( "accountStatusChangeModalLabel" ).innerHTML = "Account " + accountStatusChangeText
	document.getElementById( "accountStatusChangeButton" ).innerHTML = accountStatusChangeText
	document.getElementById( "accountStatusChangeModalBody" ).innerHTML = "Do you want to really " + accountStatusChangeText.toLowerCase() + " this account ?"
	if ( id && accountStatus ) {
		$( "#accountStatusChangeButton" ).unbind( "click" ).bind( "click", function () {
			$.ajax( {
				url: "<%=userAccountStatusChange%>",
				type: "POST",
				headers: {
					'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
				},
				data: {
					'id': id,
				},
				dataType: "json",
				success: function ( res ) {
					if ( res.success === true ) {
						$( "#message" ).html( '<div class="alert alert-success alert-dismissible" role="alert">' +
							'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
							res.message +
							'</div>' ).fadeIn( 1000 )
						userList.ajax.reload( null, false );
					} else {
						$( "#message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' +
							'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
							res.message +
							'</div>' ).fadeIn( 1000 )
					}

					$( '#accountStatusChange' ).modal( 'hide' );
					clearMessage()
				}
			} )
		} )
	}
}


function accountDelete( id ) {
	if ( id ) {
		$( "#accountDeleteButton" ).unbind( "click" ).bind( "click", function () {
			$.ajax( {
				url: "<%=userAccountDelete%>",
				type: "POST",
				headers: {
					'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
				},
				data: {
					'id': id,
				},
				dataType: "json",
				success: function ( res ) {
					if ( res.success === true ) {
						$( "#message" ).html( '<div class="alert alert-success alert-dismissible" role="alert">' +
							'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
							res.message +
							'</div>' ).fadeIn( 1000 )
						userList.ajax.reload( null, false )

					} else {
						$( "#message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' +
							'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
							res.message +
							'</div>' ).fadeIn( 1000 )
					}

					$( '#accountDelete' ).modal( 'hide' )
					clearMessage()
				}
			} )
		} )
	}
}
