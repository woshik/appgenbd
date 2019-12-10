"use strict";

var timeOut, appList;
$( document ).ready( function () {
	$( "app-list-message" ).fadeOut( 0 );
	appList = $( '#appList' ).DataTable( {
		"processing": true,
		"serverSide": true,
		"order": [],
		"ajax": {
			url: '/user/app-list',
			headers: {
				'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
			},
			type: 'post'
		},
		"columnDefs": [ {
			"targets": [ 6 ],
			"orderable": false
    } ],
		"lengthMenu": [
			[ 5, 10, 25, 50, 75, 100, 200 ],
			[ 5, 10, 25, 50, 75, 100, 200 ]
		]
	} );
	setTimeout( function () {
		$( "#flashMessage" ).fadeOut( 1000 );
	}, 5000 );
	$( "#update-app-info-message" ).fadeOut( 0 );
	$( "#app-status-change-message" ).fadeOut( 0 );
} );

function appInfoUpdate( appName ) {
	$( "#appInfoUpdateForm" ).unbind( "submit" ).bind( "submit", function ( e ) {
		e.preventDefault();
		var button = $( "#updateAppInfoBtn" ),
			btnText = button.text().trim(),
			form = $( this );

		$.ajax( {
			url: form.attr( 'action' ),
			type: form.attr( 'method' ),
			headers: {
				'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
			},
			data: form.serialize() + "&appName=" + appName,
			dataType: "json",
			beforeSend: function beforeSend() {
				button.text( btnText + "..." ).append( '<img src="/images/icons/loading.svg" alt="loading" style="margin-left:10px">' ).attr( "disabled", "disabled" ).css( "cursor", "no-drop" );
			},
			success: function success( res ) {
				if ( res.success === true ) {
					appList.ajax.reload( null, false );
					$( '#updateAppInfoModal' ).modal( 'hide' );
					$( "#app-list-message" ).html( '<div class="alert alert-success alert-dismissible" role="alert">' + res.message + '</div>' ).fadeIn( 1000 );
					clearMessage( 'app-list-message' );
				} else {
					$( "#update-app-info-message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + res.message + '</div>' ).fadeIn( 1000 );
					clearMessage( 'update-app-info-message' );
				}
			},
			complete: function complete( jqXHR, textStatus ) {
				if ( textStatus === "success" ) {
					button.removeAttr( "disabled" ).css( "cursor", "" ).text( btnText ).children().remove();
				}
			}
		} );
	} );
}

function appStatusChange( appName ) {
	$( "#appStatusChangeForm" ).unbind( 'submit' ).bind( 'submit', function ( e ) {
		e.preventDefault();
		var button = $( "#appStatusChangeButton" ),
			btnText = button.text().trim(),
			form = $( this );
		$.ajax( {
			url: form.attr( 'action' ),
			type: form.attr( 'method' ),
			headers: {
				'CSRF-Token': document.querySelector( 'meta[name="csrf-token"]' ).getAttribute( 'content' )
			},
			data: {
				'appName': appName
			},
			dataType: "json",
			beforeSend: function beforeSend() {
				button.text( btnText + "..." ).append( '<img src="/images/icons/loading.svg" alt="loading" style="margin-left:10px">' ).attr( "disabled", "disabled" ).css( "cursor", "no-drop" );
			},
			success: function success( res ) {
				if ( res.success === true ) {
					appList.ajax.reload( null, false );
					$( '#appStatusChangeModal' ).modal( 'hide' );
					$( "#app-list-message" ).html( '<div class="alert alert-success alert-dismissible" role="alert">' + res.message + '</div>' ).fadeIn( 1000 );
					clearMessage( 'app-list-message' );
				} else {
					$( "#app-status-change-message" ).html( '<div class="alert alert-warning alert-dismissible" role="alert">' + res.message + '</div>' ).fadeIn( 1000 );
					clearMessage( 'app-status-change-message' );
				}
			},
			complete: function complete( jqXHR, textStatus ) {
				if ( textStatus === "success" ) {
					button.removeAttr( "disabled" ).css( "cursor", "" ).text( btnText ).children().remove();
				}
			}
		} );
	} );
}

function clearMessage( id ) {
	clearTimeout( timeOut );
	timeOut = setTimeout( function () {
		$( "#" + id ).fadeOut( 1000 );
	}, 5000 );
}
