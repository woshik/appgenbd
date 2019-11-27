"use strict";

const { randomBytes } = require('crypto')
const dateTime = require('date-and-time')
const { hashPassword } = require(join(BASE_DIR, 'core', 'util'))

module.exports = (userInfo) => {
    return new Promise((resolve, reject) => {
        let db = require(join(BASE_DIR, 'db', 'database')).getDB()
        db.createCollection('users')
            .then(userCollection => {
                userCollection.findOne({ email: userInfo.email }, { projection: { _id: 1 } })
                    .then(id => {
                        if (!!id) return resolve({ success: false, info: 'Email address already registered' });

                        hashPassword(userInfo.password)
                            .then(passwordHashed => {
                                let now = dateTime.addHours(new Date(), 6),
                                    now2 = now,
                                    BdNowWithDate = dateTime.format(now, "YYYY-MM-DD"),
                                    rd = randomBytes(4).toString('hex'),
                                    timeStamp = now2.setMinutes(now2.getMinutes() + 10)

                                userCollection.insertOne({
                                        userRDId: rd + `${dateTime.format(now, 'DD')}aa${dateTime.format(now, 'MM')}` + now2.setMinutes(now2.getMinutes() + 20),
                                        name: userInfo.name,
                                        number: userInfo.number,
                                        email: userInfo.email,
                                        password: passwordHashed,
                                        token: randomBytes(3).toString('hex'),
                                        token_refresh: timeStamp,
                                        account_activation_start_date: BdNowWithDate,
                                        account_activation_end_date: BdNowWithDate,
                                        account_create: dateTime.format(now, "YYYY-MM-DD hh:mm:ss A"),
                                    })
                                    .then(result => resolve({ success: true, info: result }))
                                    .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}