const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// function for verifying jwt
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
    })
}

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fbieij7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        const servicesCollection = client.db('priyoGraphyDB').collection('services');
        const reviewsCollection = client.db('priyoGraphyDB').collection('reviews');

        // jwt
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ token });
        })

        // services [GET method]
        app.get('/services', async (req, res) => {
            const query = {};
            let services;
            let count;
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            if (page >= 0 && size) {
                services = await servicesCollection.find(query).skip(page * size).limit(size).toArray();
                count = await servicesCollection.estimatedDocumentCount();
            }
            else {
                services = await servicesCollection.find(query).limit(size).toArray();
            }
            res.send({ count, services });
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
        app.get('/reviews', verifyJWT, async (req, res) => {
            const email = req.query.email;
            // verifying jwt token with valid user
            if (req.decoded.currentUserEmail !== email) {
                return res.status(403).send({ message: 'unauthorized access' });
            }
            const query = { userEmail: email };
            const reviews = await reviewsCollection.find(query).toArray();
            res.send(reviews);
        })

        // reviews based on service id [GET method]
        app.get('/reviews/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id };
            const dateSort = { date: -1 }; // sort reviews by latest date in descending
            const reviews = await reviewsCollection.find(query).sort(dateSort).toArray();
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