const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express()
require('dotenv').config()
const cookieParser = require('cookie-parser');

const port = process.env.PORT || 5000;


app.use(cors({
  origin:'*',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())







const uri = `mongodb+srv://${process.env.SRC_USER}:${process.env.SECRET_KEY}@cluster0.gegfn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});




const logger = async(req, res, next) =>{
  console.log('called', req.host, req.originalUrl)
  next()
}


const verifyToken = async(req, res, next)=>{
  const token = req.cookies?.token;
  // console.log('value of ', token)
  if(!token){
    return res.status(401).send({message: 'not authorrized'})
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, decoded)=>{
    console.log(process.env.ACCESS_TOKEN_SECRET)
    if(err){
      console.log(err)
      // return res.status(401).send({message: 'unAuthorized'})
    }
    console.log('value in the token', decoded)
    next()
  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


const CarDoctorsDB = client.db('CarDoctorsDB').collection('services');
const CheckOut = client.db('CarDoctorsDB').collection("orders");



// auth related api
app.post('/jwt', logger, async(req, res)=>{
  const user = req.body;
  console.log(user)
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '5h' })
 res
 .cookie('token',  token,{
  httpOnly: true,
  secure: false,
  // sameSite: 'none'
 })
 .send({success: true})
})


// services relate api
app.post('/checkout',async(req, res)=>{
  const order = req.body;
  const result = await CheckOut.insertOne(order)
  res.send(result)

})
app.get('/checkout/:id',async(req, res)=>{
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

app.get('/checkout',verifyToken, logger,async(req, res)=>{
  // console.log('find email',req.query)
  // console.log('tok tok tok', req.cookies.token)
  let query ={};
  if(req.query?.email){
    query ={ email : req.query.email}
  }
  const result = await CheckOut.find(query).toArray()
  res.send(result)
} )
app.get('/services', logger,async(req, res)=>{
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