const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fbieij7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        const servicesCollection = client.db('priyoGraphyDB').collection('services');
        const reviewsCollection = client.db('priyoGraphyDB').collection('reviews');

        // services [GET method]
        app.get('/services', async (req, res) => {
            const query = {};
            let services;
            if (req.query.size) {
                const size = parseInt(req.query.size);
                services = await servicesCollection.find(query).limit(size).toArray();
            }
            else {
                services = await servicesCollection.find(query).toArray();
            }
            res.send(services);
        })

        // services [GET method - single data]
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        })

        // services [POST method]
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.send(result);
        })

        // reviews based on user email [GET method]
        app.get('/reviews', async (req, res) => {
            const email = req.query.email;
            const query = { userEmail: email };
            const reviews = await reviewsCollection.find(query).toArray();
            res.send(reviews);
        })

        // reviews based on service id [GET method]
        app.get('/reviews/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id };
            const reviews = await reviewsCollection.find(query).toArray();
            res.send(reviews);
        })

        // reviews based on id [GET method - single data]
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewsCollection.findOne(query);
            res.send(review);
        })

        // reviews [PUT method]
        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const review = req.body;
            const options = { upsert: true };
            const updateReview = {
                $set: {
                    reviewText: review.reviewText,
                    rating: review.rating,
                }
            };
            const result = await reviewsCollection.updateOne(filter, updateReview, options);
            res.send(result);
        })

        // reviews [POST method]
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        })

        // reviews [DELETE method]
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally { }
}
run().catch(error => console.error(error));


app.get('/', (req, res) => {
    res.send('Priyo Graphy Server is running');
})

app.listen(port, () => {
    console.log("Server is running on port:", port);
})