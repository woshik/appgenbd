const { join } = require('path')
const config = require('config')
const MongoClient = require('mongodb').MongoClient;
const { logger } = require(join(__dirname, '..', 'core', 'util'))

let _db;

const mongoClient = new Promise((resolve, reject) => {
    MongoClient.connect(config.get('database_connection_string'), { useNewUrlParser: true, useUnifiedTopology: true })
        .then(client => {
            _db = client.db('appgenbd')
            resolve()
        })
        .catch(err => {
            reject(err)
        })
})


const getDB = () => {
    if (_db) {
        return _db
    }
    console.log('database not found')
    logger.error('database not found')
}

module.exports = {
    mongoClient,
    getDB
}