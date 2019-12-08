"use strict";

$( document ).ready( function () {

	$.easing.def = "easeOutBounce";
	$( 'li.button a' ).click( function ( e ) {
		e.preventDefault();
		var dropDown = $( this ).parent().next();
		$( '.dropdown' ).not( dropDown ).slideUp( 'slow' );
		dropDown.slideToggle( 'slow' );
	} );

	// $( '#sidebarCollapse' ).on( 'click', function () {
	// 	$( '#sidebar' ).toggleClass( 'active' );
	// } );

	$( ".dropdown" ).hover( function () {
		$( '.profile-dropdown-menu', this ).stop( true, true ).slideDown( "fast" );
		$( this ).toggleClass( 'open' );
	}, function () {
		$( '.profile-dropdown-menu', this ).stop( true, true ).slideUp( "fast" );
		$( this ).toggleClass( 'open' );
	} );

} );
