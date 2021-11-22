const { MongoClient } = require('mongodb');
const { initializeApp } = require('firebase-admin/app');

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lklnw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
	try {
	  await client.connect();
	  const database = client.db('droneHouse');
	  const productCollection = database.collection('products');
	  const usersCollection = database.collection('users');
	  const ordersCollection = database.collection('orders');
	  const reviewsCollection = database.collection('reviews');

	  //post products api
	  app.post('/products', async (req, res) => {
		  const product = req.body;
		  const result = await productCollection.insertOne(product);
		  res.json(result);
	  });

	  //get products api
	  app.get('/products', async(req,res) => {
		  const cursor = productCollection.find({});
		  const products = await cursor.toArray();
		  res.send(products);
	  });

	  //get api for single product
		app.get('/products/:id', async(req, res) => {
			const id = req.params.id;
			const query = {_id: ObjectId(id)};
			const order = await productCollection.findOne(query);
			res.json(order);
		});


	  //delete single product
		app.delete('/products/:id', async (req,res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id)};
			const result = await productCollection.deleteOne(query);
			res.json(result);
		})

		//post review
		app.post('/reviews', async (req, res) => {
			const review = req.body;
			const result = await reviewsCollection.insertOne(review);
			res.json(result);
		});

		//get review api
		app.get('/reviews', async(req,res) => {
			const cursor = reviewsCollection.find({});
			const reviews = await cursor.toArray();
			res.send(reviews);
		});

	  //post Orders
	  app.post('/orders', async(req,res)=>{
		  const order = req.body;
		  const result = await ordersCollection.insertOne(order);
		  res.json(result);
	  });

	  // get api for orders
		app.get('/orders', async (req, res)=> {
			const cursor = ordersCollection.find({});
			const orders = await cursor.toArray();
			res.send(orders);
		});

		// get api for myOrder
		app.get('/orders/:email', async(req, res) => {
			const email = req.params.email;
			const cursor = ordersCollection.find({"email": email});
			const myOrders = await cursor.toArray();
			res.send(myOrders);
		});

		//get api for single order
		app.get('/orders/:id', async(req, res) => {
			const id = req.params.id;
			const query = {_id: ObjectId(id)};
			const order = await ordersCollection.findOne(query);
			res.json(order);
		});


		 //UPDATE orders API
		 app.put('/orders/:id', async (req, res) => {
			const id = req.params.id;
			const updatedUser = req.body;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					status : "Shipped",
				},
			};
			const result = await ordersCollection.updateOne(filter, updateDoc, options);
			res.json(result);
		});

		//delete single order
		app.delete('/orders/:id', async (req,res) => {
			const id = req.params.id;
			console.log(id);
			const query = { _id: ObjectId(id)};
			const result = await ordersCollection.deleteOne(query);
			res.json(result);
		})


	  //get users by email
	  app.get('/users/:email', async (req, res) => {
		const email = req.params.email;
		const query = { email: email };
		const user = await usersCollection.findOne(query);
		let isAdmin = false;
		if (user?.role === 'admin') {
			isAdmin = true;
		}
		res.json({ admin: isAdmin });
	})

	  //post users
	  app.post('/users', async (req, res) => {
		const user = req.body;
		const result = await usersCollection.insertOne(user);
		res.json(result);
	});

	//put users
	app.put('/users', async (req, res) => {
		const user = req.body;
		const filter = { email: user.email };
		const options = { upsert: true };
		const updateDoc = { $set: user };
		const result = await usersCollection.updateOne(filter, updateDoc, options);
		res.json(result);
	});

	//get users
	app.get('/users', async (req,res) => {
		const cursor = usersCollection.find({});
		const users = await cursor.toArray();
		res.send(users);
	});

	//put admin
	app.put('/users/admin', async (req, res) => {
		const user = req.body;
		const filter = {email: user.email};
		const updateDoc = {$set:{role:'admin'}};
		const result = await usersCollection.updateOne(filter, updateDoc);
		res.json(result);

	})

	} finally {

	  //await client.close();
	}
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('Running Server...');
})

app.listen(port, () => {
	console.log('Running on Port', port);
})