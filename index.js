const express=require("express")
const cookieParser=require("cookie-parser")
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors=require("cors")
require('dotenv').config()
const port=process.env.port || 5000


const app =express()
// all middlewares.
app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.qe6izo7.mongodb.net/?retryWrites=true&w=majority`;

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


const database=client.db("Public_library")
    // all api is form here.
app.get("/", async(req,res)=>{
    res.send(`this server is running on ${port} port`)
})

// get authors.
const authorCollections=database.collection("Authors")
app.get("/authors" ,async(req,res)=>{
  const result=await authorCollections.find().toArray()
  res.send(result)
})
// post new author
app.post("/post_author",async(req,res)=>{
  const data=req.body
  const result=await authorCollections.insertOne(data)
  res.send(result)
})


//                   end           .
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log(`this server is running on http://localhost:${port}`)
})