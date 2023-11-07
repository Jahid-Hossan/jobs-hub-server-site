const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER, process.env.DB_PASS)



// const uri = "mongodb+srv://<username>:<password>@cluster0.shpjug3.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.shpjug3.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const jobsCollection = client.db("allJobsDB").collection("addedJobs")
        const appliedCollection = client.db("allJobsDB").collection("appliedJobs")

        app.get('/listedJobs', async (req, res) => {
            try {
                const category = req.query?.category;
                // console.log(category)
                let query = {}
                if (req.query?.category) {
                    query = { category: req.query?.category }
                }
                const cursor = jobsCollection.find(query)
                const result = await cursor.toArray();
                // console.log(result)
                // console.log("cursor", cursor)
                res.send(result)
            } catch (error) {
                console.log(error)
            }
        })

        app.get('/myJobs', async (req, res) => {
            try {
                const email = req.query?.email;
                // console.log(category)
                let query = {}
                if (req.query?.category) {
                    query = { email: req.query?.email }
                }
                const cursor = jobsCollection.find(query)
                const result = await cursor.toArray();
                // console.log(result)
                // console.log("cursor", cursor)
                res.send(result)
            } catch (error) {
                console.log(error)
            }
        })

        app.post('/listedJobs', async (req, res) => {
            try {
                const job = req.body;
                // console.log(job)
                const result = await jobsCollection.insertOne(job);
                res.send(result)
            } catch (error) {
                console.log(error)
            }
        })

        app.patch('/listedJobs/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const applicantCount = req.body;
                const filter = { _id: new ObjectId(id) }
                // console.log(applicantCount)
                const applicantInc = {
                    $inc: {
                        applicantNo: 1
                    }
                }
                const result = await jobsCollection.updateOne(filter, applicantInc)

                res.send(result)
            } catch (error) {
                console.log(error)
            }
        })

        app.delete('/listedJobs/:id', async (req, res) => {
            try {
                const id = req.params.id;
                console.log(id)
                const query = { _id: new ObjectId(id) }
                const result = await jobsCollection.deleteOne(query)
                res.send(result);
            } catch (error) {
                console.log(error)
            }
        })
        app.get('/listedJobs/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await jobsCollection.findOne(query)
                res.send(result);
            } catch (error) {
                console.log(error)
            }
        })

        app.post('/applied', async (req, res) => {
            try {
                const application = req.body;
                // console.log(application)
                const result = await appliedCollection.insertOne(application);
                res.send(result)
            } catch (error) {
                console.log(error)
            }
        })

        app.get('/appliedJobs', async (req, res) => {
            try {
                const Email = req.query.category;
                console.log(Email)
                let query = {};
                if (req.query?.applicantEmail) {
                    if (req.query?.category) {
                        query = {
                            applicantEmail: req.query?.applicantEmail,
                            category: req.query?.category
                        }
                        console.log('true')
                    } else {
                        query = {
                            applicantEmail: req.query?.applicantEmail
                        }
                        console.log('false')
                    }
                }
                const cursor = appliedCollection.find(query);
                const result = await cursor.toArray()
                res.send(result)
            } catch (error) {
                console.log(error)
            }
        })


        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



// EXPRESS

app.get('/', (req, res) => {
    res.send('Jobs-Hub server is running')
})

app.listen(port, () => {
    console.log(`Jobs-Hub server is running on port ${port}`)
})