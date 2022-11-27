const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pxpswgp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const productscollections = client.db('verkaufer').collection('category')
        const bookigsCollections = client.db('verkaufer').collection('bookings')
        const userscollections = client.db('verkaufer').collection('users')

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }
            const result = await userscollections.updateOne(filter, updateDoc, options)
            console.log(result)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1D', })
            res.send({ result, token })
        })
        app.get('/category', async (req, res) => {
            const query = {};
            const options = await productscollections.find(query).toArray();
            res.send(options);
        })
        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const type = await productscollections.findOne(query);
            res.send(type);

        })
        app.post('/bookings', async (req, res) => {
            const book = req.body;
            const result = await bookigsCollections.insertOne(book);
            res.send(result);
        })
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookigsCollections.find(query).toArray();
            res.send(bookings);
        })

    }
    finally {

    }

}

run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('verkaufer is running')
})
app.listen(port, () => console.log('verkaufer de is running'))