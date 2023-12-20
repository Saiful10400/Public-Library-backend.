const express=require("express")
const cookieParser=require("cookie-parser")
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port=process.env.port || 5000


const app =express()
// all middlewares.
app.use(express.json())



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



    // all api is form here.
app.get("/", async(req,res)=>{
    res.send(`this server is running on ${port} port`)
})



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