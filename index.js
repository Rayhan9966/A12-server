const env =require("dotenv")
env.config()

const express= require('express');
const app =express();
const cors=require('cors');
const jwt = require('jsonwebtoken');
const port= process.env.PORT ||5000;

//MIDLEWRE
app.use(cors());
app.use(express.json());

//MONGO

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ptxksnq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);
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
    // await client.connect();
    // await client.connect();



    const biodataCollection=client.db("bdMatrimonyDB").collection("biodata");
    const userCollection=client.db("bdMatrimonyDB").collection("users");



     // jwt related api
     app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })

    //user api 
    app.get('/users',  async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.patch('/users/admin/:id',async(req,res)=>{
      const id = req.params.id;
      console.log(id);
      const filter = { _id:id }
      const updateDoc={
        $set:{
          role:'admin'
        }
      }
      const result=await userCollection.updateOne(filter,updateDoc);
      res.send(result);
    })
    //delete user
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id:id }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

app.post('/users', async (req,res)=>{
  const user=req.body;
  //unique email
  const query = { email: user.email };
  const existingUser = await userCollection.findOne(query);
  if(existingUser){
    return res.send({message: 'user already exist', insertedId : null})
  }
  const result = await userCollection.insertOne(user);
  res.send(result);

})

app.get('/biodata', async (req,res) =>{
    const result = await biodataCollection.find().toArray();
    res.send(result);
})

//delete
app.delete('/biodata/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const query = { _id:id }
    const result = await biodataCollection.deleteOne(query);
    res.send(result);
  });



//     // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close(); 
  }
}
run().catch(console.dir);















//

app.get('/',(req,res)=>{
    res.send('Matrimonial is running')
})

app.listen (port,()=>{
    console.log(`Matrimonial is runnning on port ${port}`);
})