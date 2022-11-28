const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pxpswgp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function verifyJWT(req, res, next) {

    const authheader = req.headers.authorization;
    if (!authheader) {
        return res.status(401).send('unauthorized access')
    }
    const token = authheader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ messsage: 'forbidden access' })

        }
        req.decoded = decoded;
        next();

    })

}
async function run() {
    try {
        const productscollections = client.db('verkaufer').collection('category')
        const bookigsCollections = client.db('verkaufer').collection('bookings')
        const userscollections = client.db('verkaufer').collection('users')



        app.get('/users', async (req, res) => {
            const query = {};
            const users = await userscollections.find(query).toArray();
            res.send(users);
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userscollections.insertOne(user);
            res.send(result);
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
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await userscollections.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1D' })
                return res.send({ accessToken: token });
            }



            res.status(403).send({ accessToken: "" })
        })
        app.post('/bookings', async (req, res) => {
            const book = req.body;
            const result = await bookigsCollections.insertOne(book);
            res.send(result);
        })
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userscollections.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        })
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userscollections.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })
        app.put('/users/admin/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userscollections.findOne(query);
            if (user?.role !== 'admin') {

                return res.status(403).send({ message: 'forbidden access' })
            }

            const id = req.params.id;

            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userscollections.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })

            }

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