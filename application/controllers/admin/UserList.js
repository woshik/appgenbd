"use strict";

const web = require( join( BASE_DIR, 'urlconf', 'webRule' ) )
const dateTime = require( 'date-and-time' )
const {
	companyInfo,
	fromErrorMessage
} = require( join( BASE_DIR, 'core', 'util' ) )
const {
	admin
} = require( join( BASE_DIR, 'urlconf', 'sideBar' ) )
const {
	getUserList
} = require( join( MODEL_DIR, 'admin/Model_User_List' ) )

exports.userListView = ( req, res, next ) => {
	res.render( "admin/base-template", {
		layout: 'user-list',
		info: companyInfo,
		title: 'Admin',
		path: req.path,
		sidebar: admin,
		email: req.user.email,
		csrfToken: req.csrfToken(),
		paymentURL: web.payment.url,
		accountStatusChangeURL: web.accountStatusChange.url,
		accountDeleteURL: web.accountDelete.url
	} )
}

exports.userList = ( req, res, next ) => {
	getUserList( req.body )
		.then( result => {
			let userList = []

			result.data.map( user => {
				let button = `	<a href="" class="btn btn-primary btn-icon">
									<i class="fas fa-eye"></i>
								</a>`

				if ( !user.account_delete ) {
					button = `<a href="javascript:void(0)" title="Payment" class="btn btn-primary btn-icon" type="button"
						data-toggle="modal" data-target="#paymentModal" onclick="payment('${user._id}')" data-backdrop="static">
						   <i class="fas fa-money-check-alt"></i></i>
					</a>` +
						button +
						`<a href="javascript:void(0)" title="Account Status Change" class="btn btn-primary btn-icon" type="button" data-toggle="modal"
					   		data-target="#accountStatusChangeModal" onclick="accountStatusChange('${user._id}')" data-backdrop="static">
							<i class="fas fa-exchange-alt"></i>
						</a>

						<a href="javascript:void(0)" class="btn btn-primary btn-icon" type="button"
					   		data-toggle="modal" data-target="#accountDeleteModal" title="Account Delete" onclick="accountDelete('${user._id}')" data-backdrop="static">
						   	<i class="fas fa-trash-alt"></i>
						</a>`
				}

				userList.push( [
		                user.name,
		                user.mobile,
		                user.email,
						user.account_create_date,
						`<i class="far fa-${user.account_active ? 'check' : 'times' }-circle"></i>`,
						`<i class="far fa-${user.account_disable ? 'check' : 'times' }-circle"></i>`,
						`<i class="far fa-${user.account_delete ? 'check' : 'times' }-circle"></i>`,
		                dateTime.format( new Date( user.account_activation_end_date ), 'DD-MM-YYYY' ),
						`<i class="far fa-${user.trial ? 'check' : 'times' }-circle"></i>`,
		                button
					] )
			} )

			return res.json( {
				data: userList,
				recordsTotal: result.recordsTotal,
				recordsFiltered: result.recordsFiltered,
			} )
		} )
		.catch( err => next( err ) )
}

exports.userMaxAppInstall = ( req, res, next ) => {
	try {
		var id = ObjectId( req.query.id )
	} catch {
		return res.status( 200 ).json( {
			success: false,
			message: 'Please, don\'t violate the process.'
		} )
	}

	let user = new model( 'users' )

	user.findOne( {
			_id: id
		}, {
			max_app_install: 1,
			_id: 0
		} )
		.then( data => {
			if ( !data ) {
				return res.json( {
					success: false,
					message: "User not found"
				} )
			}

			return res.json( {
				success: true,
				maxApp: data.max_app_install
			} )

		} )
		.catch( err => next( err ) )
}
