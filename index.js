const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


//middleware
app.use(cors())
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q2isoyp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const categoryCollection = client.db("toyDb").collection("category");
    const cartCollection = client.db("toyDb").collection("carts");
    const toyCollection = client.db("toyDb").collection("toy");


    app.get('/toy', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/toy/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query)
      res.send(result)
    })

    app.post('/toy', async (req, res) => {
      const newToy = req.body;
      console.log(newToy)
      const result = await toyCollection.insertOne(newToy);
      res.send(result)
    })

    app.put('/toy/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          name: updatedToy.name, 
          price: updatedToy.price, 
          quantity: updatedToy.quantity, 
          description: updatedToy.description
        }
      }
      const result= await toyCollection.updateOne(filter,toy, options)
      res.send(result);
    })

    app.delete('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/category', async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result);
    })

    //app.post('/category',async(req,res)=>{
    //  const newItem = req.body;
    //  const result = await categoryCollection.insertOne(newItem)
    //  res.send(result)
    //})

    //cart collection
    app.get('/carts', async (req, res) => {
      const email = req.query.email
      if (!email) {
        res.send([])
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray()
      res.send(result)
    })
    app.post('/carts', async (req, res) => {
      const item = req.body;
      console.log(item)
      const result = await cartCollection.insertOne(item)
      res.send(result)
    })
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('toy mart operation is running here')
})

app.listen(port, () => {
  console.log(`toy mart server is running on PORT ${port}`);
})