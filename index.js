const express = require("express");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.port || 5000;

const app = express();
// all middlewares.
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.qe6izo7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("Public_library");
    // all api is form here.
    app.get("/", async (req, res) => {
      res.send(`this server is running on ${port} port`);
    });

    // ...............Authors.................
    // get authors.
    const authorCollections = database.collection("Authors");
    app.get("/authors", async (req, res) => {
      const result = await authorCollections.find().toArray();
      res.send(result);
    });
    // post new author
    app.post("/post_author", async (req, res) => {
      const data = req.body;
      const result = await authorCollections.insertOne(data);
      res.send(result);
    });
    // get a author by id
    app.get("/get_a_author", async (req, res) => {
      const query = { _id: new ObjectId(req.query.id) };
      const result = await authorCollections.findOne(query);
      res.send(result);
    });
    //

    // ...............add user to follower array after follow. .........
    app.post("/follow_a_author", async (req, res) => {
      // identify user.
      const query = { _id: new ObjectId(req?.body?.authorId) };
      const createdData = { $push: { followers: req?.body?.userId } };
      const result = await authorCollections.updateOne(query, createdData, {
        upsert: true,
      });
      res.send(result);
    });
    // .................remove user after unfollow.......................
    app.post("/unfollow_a_author", async (req, res) => {
      const query = { _id: new ObjectId(req?.body?.authorId) };
      const createdData = { $pull: { followers: req?.body?.userId } };
      const result = await authorCollections.updateOne(query, createdData);
      res.send(result);
    });

    // ...............Catagory of books.................
    // get catagoryes.
    const catagoryCollection = database.collection("Books_category");
    app.get("/catagoryes", async (req, res) => {
      const result = await catagoryCollection.find().toArray();
      res.send(result);
    });
    // add new catagory.
    app.post("/add_catagory", async (req, res) => {
      const data = req.body.newcategory;
      const query = { _id: new ObjectId("6582ddf9ea5940c307c0ceb3") };
      const result = await catagoryCollection.updateOne(query, {
        $push: { categories: data },
      });
      res.send(result);
    });

    // ..................user.............
    // post a new user.
    const userCollection = database.collection("Users");
    app.post("/post_a_user", async (req, res) => {
      const data = req.body;
      const result = await userCollection.insertOne(data);
      res.send(result);
    });

    // get a new user with email.
    app.get("/get_a_user", async (req, res) => {
      const data = req.query.email;
      const query = { email: data };
      const result = await userCollection.findOne(query);
      res.send(result);
    });
    // get all user.
    app.get("/get_all_user", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    //...................class.......................
    // get all class name.
    const classCollection = catagoryCollection;
    app.get("/get_classe", async (req, res) => {
      const query = { _id: new ObjectId("65929a580677d4b83128b2be") };
      const result = await classCollection.findOne(query);
      res.send(result);
    });

    //...................class.......................
    // get all class name.
    const subjectcollection = catagoryCollection;
    app.get("/get_subjects", async (req, res) => {
      const query = { _id: new ObjectId("6592a3470677d4b831394dbe") };
      const result = await subjectcollection.findOne(query);
      res.send(result);
    });

    // ...................books.........................
    const bookCollection = database.collection("Books");
    // post a new book.
    app.post("/upload_a_book", async (req, res) => {
      const data = req.body;
      const query = { email: data.uploaderEmail };
      const result = await bookCollection.insertOne(data);
      if (data.publish) {
        const userDataUpdate = await userCollection.updateOne(query, {
          $inc: { totalBooks: 1 },
        });
        res.send({ userDataUpdate, result });

        // ...................send notification.............
        // for academic books....................

        if(data.bookType==="academic"){
          const result = await userCollection.updateMany(
            {},
           {$push:{notification: {
            message: `Class ${data.forClass} ${data.banglaName} book is now available.`,
            visibled:false, messageDetails:data
          }}},{upsert:true}
          );
          console.log(result)

        } else{         
// ........................for non academic books. ...............
           // sending book uploading notification to the user.
        const authorId = data.authorId;
        // get all user who are following this book author.
        let followingUser = await authorCollections.findOne({
          _id: new ObjectId(authorId),
        });
        followingUser = followingUser.followers;
        // now run a loop into the users id to send a notification.
        followingUser.map(async (item) => {
          let userId =new ObjectId(item);
          const result = await userCollection.updateOne(
            { _id: userId },
           {$push:{notification: {
            message: data.bookType==="academic"?`Class ${data.forClass} ${data.banglaName} book is now available.`:`${data.banglaName} by ${data.authorName} is now available.`,
            visibled:false, messageDetails:data
          }}},{upsert:true}
          );
          console.log(result)
        });

        }

       

        // end.
      } else if (!data.publish) {
        const userDataUpdate = await userCollection.updateOne(query, {
          $inc: { pandingBooks: 1 },
        });
        res.send({ userDataUpdate, result });
      } else {
        res.send(result);
      }
    });
    // get a book by id
    app.get("/get_a_book", async (req, res) => {
      const query = { _id: new ObjectId(req.query.id) };
      const result = await bookCollection.findOne(query);
      res.send(result);
    });
    // get all books of a user by user eamil.
    app.post("/get_my_all_books", async (req, res) => {
      const query = { uploaderEmail: req.body.email };
      const result = await bookCollection.find(query).toArray();
      res.send(result);
    });
    // get all books for admin.panel(all authorised and unauthorised books are included.)
    app.get("/get_all_book", async (req, res) => {
      const result = await bookCollection.find().toArray();
      // const result=await bookCollection.updateMany({},{$set:{"rating":{"rating":0,"ratedPeople":0},"reviewComments":[]}},{upsert:true})
      // console.log(result)
      res.send(result);
    });
    // get all published parmission granted books.
    app.get("/get_authorised_books", async (req, red) => {
      const result = await bookCollection.find({ publish: true }).toArray();
      res.send(result);
    });
    // get all published parmission granted a author books.
    app.post("/get_a_author_books", async (req, res) => {
      const authorId = req.body.id;
      const result = await bookCollection
        .find({ authorId, publish: true })
        .toArray();
      res.send(result);
    });

    // get unpublished(waiting for admin confirmation)books.
    app.get("/get_unPublish_books", async (req, res) => {
      const result = await bookCollection
        .find({ publish: false })
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });
    // delete a book
    app.post("/delete_a_book", async (req, res) => {
      const query = { _id: new ObjectId(req.body.id) };
      const result = await bookCollection.deleteOne(query);
      res.send(result);
    });

    // confirm a book publishing status.
    app.patch("/update_a_book", async (req, res) => {
      const query = { _id: new ObjectId(req.body.id) };
      const result = await bookCollection.updateOne(query, {
        $set: { publish: true },
      });
      res.send(result);
    });

    ///////////////////////////end////////////////////////////////
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`this server is running on http://localhost:${port}`);
});
