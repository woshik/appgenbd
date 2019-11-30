"use strict";

$( document ).ready( function () {
	var timeOut,
		button = $( "#buttonload" );
	$( "#message" ).fadeOut( 0 );
	$( "#registrationForm" ).unbind( "submit" ).bind( "submit", function ( e ) {
		e.preventDefault();
		var form = $( this ),
			url = form.attr( "action" ),
			type = form.attr( "method" );
		$.ajax( {
			url: url,
			type: type,
			headers: {
				'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
			},
			data: form.serialize(),
			dataType: "json",
			beforeSend: function beforeSend() {
				button.text( "Account Creating..." ).append( '<img src="/images/icons/loading.svg" alt="loading" style="margin-left:10px">' ).attr( "disabled", "disabled" ).css( "cursor", "no-drop" );
			},
			success: function success( res ) {
				if ( res.success === true ) {
					window.location = res.url;
				} else {
					$( "#message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' + res.message + "</div>" ).fadeIn( 1000 );
					clearTimeout( timeOut );
					timeOut = setTimeout( function () {
						$( "#message" ).fadeOut( 1000 );
					}, 5000 );
				}
			},
			complete: function complete( jqXHR, textStatus ) {
				if ( textStatus === "success" ) {
					button.removeAttr( "disabled" ).css( "cursor", "" ).text( "Create Account" ).children().remove();
				}
			}
		} );
	} );
} );
