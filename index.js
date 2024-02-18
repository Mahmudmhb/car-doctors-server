const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000;








const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.SRC_USER}:${process.env.SECRET_KEY}@cluster0.gegfn.mongodb.net/?retryWrites=true&w=majority`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


const CarDoctorsDB = client.db('CarDoctorsDB').collection('services');
const CheckOut = client.db('CarDoctorsDB').collection("orders");


app.post('/checkout', async(req, res)=>{
  const order = req.body;
  const result = await CheckOut.insertOne(order)
  res.send(result)

})
app.get('/checkout/:id', async(req, res)=>{
  const id = req.params.id;
  // console.log(id)
  const cursor = {_id: new ObjectId(id)}
  const result = await CheckOut.findOne(cursor)
  res.send(result)
})

app.delete('/checkout/:id', async(req, res)=>{
  const id = req.params.id;
  const find = {_id: new ObjectId(id)}
  const result = await CheckOut.deleteOne(find)
  console.log(result)
  res.send(result)
})

app.patch('/checkout/:id', async(req, res)=>{
  const id = req.params.id
  const filter = {_id: new ObjectId(id)}
  const updateBooking = req.body;
  const updateDoc = {
    $set: {
      satus: updateBooking.satus
    },
  };
  const result = await CheckOut.updateOne(filter, updateDoc,);
  res.send(result)

  console.log(updateBooking)
  console.log(result)

})
// app.get('/checkout', async(req, res)=>{
//   console.log(req.query.email)
//   const cursor = await CheckOut.find().toArray();
//   res.send(cursor)
// })

app.get('/checkout', async(req, res)=>{
  // console.log('find email',req.query)
  let query ={};
  if(req.query?.email){
    query ={ email : req.query.email}
  }
  const result = await CheckOut.find(query).toArray()
  res.send(result)
} )
app.get('/services', async(req, res)=>{
    const cursor = CarDoctorsDB.find()
    const result = await cursor.toArray()
    res.send(result)
})

app.get('/services/:id', async(req, res)=>{
    const id = req.params.id;
    const find = {_id: new ObjectId(id)}
    const result = await CarDoctorsDB.findOne(find)
    res.send(result)
})

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res)=>{
    console.log('test server is running')
    res.send(`server is running ${port}`)
})

app.listen(port, ()=>{
    console.log(`server is running of ${port}`)
})