const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pxpswgp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {

    }
    finally {
        const productscollections = client.db('verkaufer').collection('products')
        app.get('/products', async (req, res) => {
            const query = {};
            const options = await productscollections.find(query).toArray();
            res.send(options);
        })
    }

}

run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('verkaufer is running')
})
app.listen(port, () => console.log('verkaufer de is running'))