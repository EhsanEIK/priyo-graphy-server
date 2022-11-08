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