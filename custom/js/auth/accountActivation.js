"use strict";

$( "#message" ).fadeOut( 0 );
var timeOut;
var button = $( "#buttonload" );
var btnText = button.text().trim();
$( document ).ready( function () {
	$( "#activationForm" ).unbind( "submit" ).bind( "submit", function ( e ) {
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
			beforeSend: function beforeSend() {
				button.text( btnText + "..." ).append( '<img src="/images/icons/loading.svg" alt="loading" style="margin-left:10px">' ).attr( "disabled", "disabled" ).css( "cursor", "no-drop" );
			},
			success: function success( res ) {
				if ( res.success === true ) {
					window.location = res.url;
				} else {
					$( "#message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' + res.message + "</div>" ).fadeIn( 1000 );
					clearMessage( "message" );
				}
			},
			complete: function complete( jqXHR, textStatus ) {
				if ( textStatus === "success" ) {
					button.removeAttr( "disabled" ).css( "cursor", "" ).text( btnText ).children().remove();
				}
			}
		} );
		return false;
	} );

	$( '#mailSending' ).click( function ( e ) {
		e.preventDefault();
		$.ajax( {
			url: e.target.href,
			type: "POST",
			headers: {
				'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
			},
			data: {
				email: $( "#email" ).val(),
				rd: $( "#rd" ).val()
			},
			dataType: "json",
			success: function success( res ) {
				if ( res.url !== undefined ) {
					window.location = res.url;
				}

				$( "#message" ).html( '<div class="alert alert-info alert-dismissible" role="alert">' + res.message + "</div>" ).fadeIn( 1000 );
				clearMessage( "message" );
			}
		} );
	} );

	clearMessage( "flashMessage" )
} );

function clearMessage( id ) {
	clearTimeout( timeOut );
	timeOut = setTimeout( function () {
		$( "#" + id ).fadeOut( 1000 );
	}, 5000 );
}
