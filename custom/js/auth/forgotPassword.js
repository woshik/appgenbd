"use strict";

var timeOut;
$( document ).ready( function () {
	$( "#message" ).fadeOut( 0 );
	$( "#forgotPasswordForm" ).unbind( "submit" ).bind( "submit", function ( e ) {
		e.preventDefault();
		var form = $( this );
		var url = form.attr( "action" );
		var type = form.attr( "method" );
		$.ajax( {
			url: url,
			type: type,
			headers: {
				'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
			},
			data: form.serialize(),
			dataType: "json",
			success: function success( res ) {
				if ( res.success === true ) {
					window.location = res.url;
				} else {
					$( "#message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' + res.message + "</div>" ).fadeIn( 1000 );
					clearTimeout( timeOut );
					timeOut = setTimeout( function () {
						$( "#message" ).fadeOut( 500 );
					}, 5000 );
				}
			}
		} );
	} );
} );
