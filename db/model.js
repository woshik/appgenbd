"use strict";

module.exports = class Model {
	constructor(collectionName) {
		this.db = require("./database").getDB();
		this.collectionName = collectionName;
	}

	save(data) {
		return new Promise((resolve, reject) => {
			this.db
				.collection(this.collectionName)
				.then(result => {
					result
						.insertOne(data)
						.then(result => resolve(result))
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
	}

	updateOne(where, updateValue) {
		return new Promise((resolve, reject) => {
			this.db
				.collection(this.collectionName)
				.then(result => {
					result
						.updateOne(where, {
							$set: updateValue
						})
						.then(result => resolve(result))
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
	}

	customUpdateOne(where, updateValue) {
		return new Promise((resolve, reject) => {
			this.db
				.collection(this.collectionName)
				.then(result => {
					result
						.updateOne(where, updateValue)
						.then(result => resolve(result))
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
	}

	updateMany(where, updateValue) {
		return new Promise((resolve, reject) => {
			this.db
				.collection(this.collectionName)
				.then(result => {
					result
						.updateMany(where, {
							$set: updateValue
						})
						.then(result => resolve(result))
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
	}

	customUpdateMany(where, updateValue) {
		return new Promise((resolve, reject) => {
			this.db
				.collection(this.collectionName)
				.then(result => {
					result
						.updateMany(where, updateValue)
						.then(result => resolve(result))
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
	}

	findOne(where, show) {
		return new Promise((resolve, reject) => {
			this.db
				.collection(this.collectionName)
				.then(result => {
					show = show || {};
					result
						.findOne(where, {
							projection: show
						})
						.then(result => resolve(result))
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
	}

	find(where, show) {
		return new Promise((resolve, reject) => {
			this.db
				.collection(this.collectionName)
				.then(result => {
					show = show || {};
					result
						.find(where, {
							projection: show
						})
						.toArray()
						.then(result => resolve(result))
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
	}

	deleteOne(where) {
		return new Promise((resolve, reject) => {
			this.db
				.collection(this.collectionName)
				.then(result => {
					result
						.deleteOne(where)
						.then(result => resolve(result))
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
	}

	deleteMany(where) {
		return new Promise((resolve, reject) => {
			this.db
				.collection(this.collectionName)
				.then(result => {
					result
						.deleteMany(where)
						.then(result => resolve(result))
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
	}

	dataTable(where, show, start, limit, sort) {
		return new Promise((resolve, reject) => {
			this.db
				.collection(this.collectionName)
				.then(result => {
					result
						.find(where, {
							projection: show,
							skip: start,
							limit: limit,
							sort: sort
						})
						.toArray()
						.then(async Data => {
							resolve({
								data: Data,
								recordsTotal: await result
									.find({
										user_id: where.user_id
									})
									.count(),
								recordsFiltered: await result.find(where).count()
							});
						})
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
	}

	dataTableForArrayElement(where, projection, base) {
		return new Promise((resolve, reject) => {
			this.db
				.collection(this.collectionName)
				.then(result => {
					result
						.findOne(where, {
							projection: projection
						})
						.then(Data =>
							resolve({
								data: Data,
								recordsTotal: this.aggregate(where, {
									size: {
										$size: "$content"
									}
								})
							})
						)
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
	}

	aggregate(match, projection) {
		return new Promise((resolve, reject) => {
			this.db
				.collection(this.collectionName)
				.then(result => {
					result
						.aggregate([
							{
								$match: match
							},
							{
								$project: projection
							}
						])
						.toArray()
						.then(Data => resolve(Data))
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
	}
};
