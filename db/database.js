const config = require('config')
const MongoClient = require('mongodb').MongoClient;

let _db;

exports.mongoClient = new Promise((resolve, reject) => {
    MongoClient.connect(config.get('database_connection_string'), { useNewUrlParser: true, useUnifiedTopology: true })
        .then(client => {
            _db = client.db('appgenbd')
            console.log('connected')
            global.model = require(join(BASE_DIR, 'db', 'model'))
            resolve()
        })
        .catch(err => {
            reject(err)
        })
})


exports.getDB = () => {
    if (_db) {
        return _db
    }
    logger.error('database not found')
}