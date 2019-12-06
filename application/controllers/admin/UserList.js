const {
	ObjectId
} = require( 'mongodb' )

exports.userListView = ( req, res, next ) => {

}

exports.userList = ( req, res, next ) => {
	const user = new model( "users" )
	user.dataTable( {}, {
			name: 1,
			number: 1,
			email: 1,
			account_create: 1,
			account_active: 1,
			email_verify: 1,
			account_activation_end: 1,
			total_payment: 1,
			account_delete: 1
		}, parseInt( req.body.start ), parseInt( req.body.length ) )
		.then( result => {
			let response = []
			result.data.map( ( user, index ) => {
				let button = !user.account_delete ? `
                        <a href="javascript:void(0)" title="Payment" class="btn btn-primary btn-icon" type="button"
                        data-toggle="modal" data-target="#clientPayment" onclick="payment('${user._id}')" data-backdrop="static">
                            <i class="fas fa-money-check-alt"></i></i>
                        </a>

                        <a href="" class="btn btn-primary btn-icon">
                            <i class="fas fa-eye"></i>
                        </a>

                        <a href="javascript:void(0)" title="Account Status Change" class="btn btn-primary btn-icon" type="button" data-toggle="modal"
                        data-target="#accountStatusChange" onclick="accountStatusChange('${user._id}','${user.account_active}')" data-backdrop="static">
                            <i class="fas fa-exchange-alt"></i>
                        </a>

                        <a href="javascript:void(0)" class="btn btn-primary btn-icon" type="button"
                        data-toggle="modal" data-target="#accountDelete" title="Account Delete" onclick="accountDelete('${user._id}')" data-backdrop="static">
                            <i class="fas fa-trash-alt"></i>
                        </a>
                        ` : ''
				response.push( [
                    user.name,
                    user.number,
                    user.email,
                    dateTime.format( new Date( user.account_create ), 'DD-MM-YYYY hh:mm:ss A' ),
                    `<i class="far fa-${user.email_verify ? 'check' : 'times' }-circle"></i>`,
                    `<i class="far fa-${user.account_active ? 'check' : 'times' }-circle"></i>`,
                    dateTime.format( new Date( user.account_activation_end ), 'DD-MM-YYYY' ),
                    ( user.total_payment ? user.total_payment : 0 ) + ' TK',
                    `<i class="far fa-${user.account_delete ? 'check' : 'times' }-circle"></i>`,
                    button
                ] )
			} )

			return res.json( {
				data: response,
				recordsTotal: result.recordsTotal,
				recordsFiltered: result.recordsFiltered,
				draw: parseInt( req.query.draw ),
			} )
		} )
		.catch( err => logger.error( err ) )
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
				return res.status( 200 ).json( {
					success: false,
					message: "User not found"
				} )
			}

			return res.status( 200 ).json( {
				success: true,
				maxApp: data.max_app_install
			} )

		} )
		.catch( err => next( err ) )
}
