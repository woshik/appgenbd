const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { join } = require('path')

MongoClient.connect('mongodb://localhost:27017/appgenbd', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        let username = crypto.randomBytes(5).toString('hex') + '@yourmail.com'
        let password = crypto.randomBytes(8).toString('hex')

        bcrypt.genSalt(10)
            .then(getSalt => {
                bcrypt.hash(password, getSalt)
                    .then(hashPassword => {
                        client.db('appgenbd').createCollection('admin')
                            .then(result => {
                                result.insertOne({ email: username, password: hashPassword, super_user: true })
                                    .then(result => {
                                        console.log(`username: ${username}`)
                                        console.log(`password: ${password}`)
                                        process.exit(1)
                                    })
                                    .catch(err => console.log(err.message))
                            })
                            .catch(err => console.log(err.message))
                    })
                    .catch(err => console.log(err.message))
            })
            .catch(err => console.log(err.message))
    })
    .catch(err => console.log(err.message))