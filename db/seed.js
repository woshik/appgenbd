const MongoClient = require("mongodb").MongoClient;
const { hash, genSalt } = require("bcryptjs");

MongoClient.connect("mongodb://localhost:27017/", {
	useNewUrlParser: true,
	useUnifiedTopology: true
})
	.then(async client => {
		try {
			await client
				.db("appgenbd")
				.collection("admin")
				.insertOne({
					email: "admin@mail.com",
					password: await hash("123456", await genSalt(10))
				});

			console.log("username: admin@mail.com");
			console.log("password: 123456");

			client.close();
		} catch (e) {
			console.log(e.message);
		}
	})
	.catch(err => console.log(err.message));
