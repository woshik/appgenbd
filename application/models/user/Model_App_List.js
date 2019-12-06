const {
	getDB
} = require( join( BASE_DIR, 'db', 'database' ) )

exports.getAppList = () => {
	getDB().createCollection( 'app' )
		.then( appCollection => {
			appCollection.
		} )
}
