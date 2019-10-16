module.exports = class Model {
    constructor(collectionName) {
        const { join } = require("path");
        this.db = require(join(__dirname, 'database')).getDB();
        this.collectionName = collectionName;
    }

    save(data) {
        return new Promise((resolve, reject) => {
            this.db.createCollection(this.collectionName)
                .then(result => {
                    result.insertOne(data)
                        .then(result => {
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    updateOne(where, updateValue) {
        return new Promise((resolve, reject) => {
            this.db.createCollection(this.collectionName)
                .then(result => {
                    result.updateOne(where, { '$set': updateValue })
                        .then(result => {
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    customUpdateOne(where, updateValue) {
        return new Promise((resolve, reject) => {
            this.db.createCollection(this.collectionName)
                .then(result => {
                    result.updateOne(where, updateValue)
                        .then(result => {
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    updateMany(where, updateValue) {
        return new Promise((resolve, reject) => {
            this.db.createCollection(this.collectionName)
                .then(result => {
                    result.updateMany(where, { '$set': updateValue })
                        .then(result => {
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    customUpdateMany(where, updateValue) {
        return new Promise((resolve, reject) => {
            this.db.createCollection(this.collectionName)
                .then(result => {
                    result.updateMany(where, updateValue)
                        .then(result => {
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    findOne(where, show = {}) {
        return new Promise((resolve, reject) => {
            this.db.createCollection(this.collectionName)
                .then(result => {
                    result.findOne(where, show)
                        .then(result => {
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    find(where, show = {}) {
        return new Promise((resolve, reject) => {
            this.db.createCollection(this.collectionName)
                .then(result => {
                    result.find(where).project(show).toArray()
                        .then(result => {
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    dataTable(where, show, start, limit) {
        return new Promise((resolve, reject) => {
            this.db.createCollection(this.collectionName)
                .then(result => {
                    result.find(where).project(show).skip(start).limit(limit).toArray()
                        .then(async (Data) => {
                            resolve({
                                data: Data,
                                recordsTotal: await result.find({ userId: where.userId }).count(),
                                recordsFiltered: await result.find(where).count()
                            })
                        })
                        .catch(err => {
                            reject(err)
                        })
                })
                .catch(err => {
                    reject(err);
                });
        })
    }
}