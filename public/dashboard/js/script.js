"use strict";

$( document ).ready( function () {

	$.easing.def = "easeOutBounce";
	$( 'li.button a' ).click( function ( e ) {
		var dropDown = $( this ).parent().next();
		$( '.dropdown' ).not( dropDown ).slideUp( 'slow' );
		dropDown.slideToggle( 'slow' );
		e.preventDefault();
	} );

	$( '#sidebarCollapse' ).on( 'click', function () {
		$( '#sidebar' ).toggleClass( 'active' );
	} );

	$( ".dropdown" ).hover( function () {
		$( '.profile-dropdown-menu', this ).stop( true, true ).slideDown( "fast" );
		$( this ).toggleClass( 'open' );
	}, function () {
		$( '.profile-dropdown-menu', this ).stop( true, true ).slideUp( "fast" );
		$( this ).toggleClass( 'open' );
	} );

	var timeOut,
		button = $( "#userProfileSettingBtn" ),
		btnText = button.text().trim();

	$( "#user-profile-setting-message" ).fadeOut( 0 );

	$( 'userProfileSetting' ).unbind( "submit" ).bind( "submit", function ( e ) {
		e.preventDefault();
		var form = $( this );
		$.ajax( {
			url: form.attr( "action" ),
			type: form.attr( "method" ),
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
					$( "#user-profile-setting-message" ).html( '<div class="alert alert-success alert-dismissible" role="alert">' + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + res.message + '</div>' ).fadeIn( 1000 );
					$( "#userProfileSettingCurrentPass" ).val( '' );
					$( "#userProfileSettingPass" ).val( '' );
					$( "#userProfileSettingConfirmPass" ).val( '' );
				} else {
					$( "#user-profile-setting-message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + res.message + '</div>' ).fadeIn( 1000 );
				}

				clearTimeout( timeOut );
				timeOut = setTimeout( function () {
					$( "#user-profile-setting-message" ).fadeOut( 1000 );
				}, 5000 );
			},
			complete: function complete( jqXHR, textStatus ) {
				if ( textStatus === "success" ) {
					button.removeAttr( "disabled" ).css( "cursor", "" ).text( btnText ).children().remove();
				}
			}
		} );
	} );
} );
