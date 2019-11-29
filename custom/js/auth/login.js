"use strict";

$( document ).ready( function () {
	var timeOut;
	$( "#loginForm" ).unbind( "submit" ).bind( "submit", function ( e ) {
		e.preventDefault();
		var form = $( this );
		var url = form.attr( "action" );
		var type = form.attr( "method" );
		$( "#message" ).fadeOut( 0 );
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
					window.location = res.message;
				} else {
					$( "#message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' + res.message + '</div>' ).fadeIn( 1000 );
					clearTimeout( timeOut );
					timeOut = setTimeout( function () {
						$( "#message" ).fadeOut( 500 );
					}, 5000 );
				}
			}
		} );
	} );

	setTimeout( function () {
		$( "#flashMessage" ).fadeOut( 1000 );
	}, 5000 );
} );
