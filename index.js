const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const port = process.env.PORT || 5000;

app.use(cors({
    origin: [
        "http://localhost:5174",
        "http://localhost:5173",
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

console.log(process.env.ACCESS_TOKEN_SECRET)



// const uri = "mongodb+srv://<username>:<password>@cluster0.shpjug3.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.shpjug3.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    console.log("toktok", token)

    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.user = decoded;
        next();
    })
}


async function run() {
    try {
        const jobsCollection = client.db("allJobsDB").collection("addedJobs")
        const appliedCollection = client.db("allJobsDB").collection("appliedJobs")

        // token
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none'

                })
                .send({ success: true })
        })

        app.post('/jwtLogout', async (req, res) => {
            const user = req.body;
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })

        app.get('/listedJobs', async (req, res) => {
            try {
                const category = req.query?.category;
                console.log(category)
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

        app.get('/myJobs', verifyToken, async (req, res) => {
            try {
                const email = req.query?.email;
                console.log(email)

                if (req.user.email !== req.query.email) {
                    return res.status(403).send({ message: 'forbidden access' })
                }

                let query = {}
                if (req.query?.email) {
                    query = { email: req.query?.email }
                }
                const cursor = jobsCollection.find(query)
                const result = await cursor.toArray();
                // console.log(result)
                console.log('query', query)
                res.send(result)
            } catch (error) {
                console.log(error)
            }
        })


        app.get('/myJobs/:id', async (req, res) => {
            try {
                const id = req.params.id;
                console.log(id)
                const query = { _id: new ObjectId(id) }
                const result = await jobsCollection.findOne(query)
                res.send(result);
                // console.log(result)
                console.log('query', query)
                res.send(result)
            } catch (error) {
                console.log(error)
            }
        })


        app.put('/myJobs/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const newData = req.body;

                const filter = { _id: new ObjectId(id) }
                const option = { upsert: true };

                console.log(Object.keys(newData).join())

                const updateData = {
                    $set: {
                        name: newData.name,
                        email: newData.email,
                        title: newData.title,
                        category: newData.category,
                        salaryFrom: newData.salaryFrom,
                        salaryTo: newData.salaryTo,
                        description: newData.description,
                        applicantNo: newData.applicantNo,
                        image: newData.image,
                        deadline: newData.deadline,
                        startDate: newData.startDate
                    }
                }

                const result = await jobsCollection.updateOne(filter, updateData, option);
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


        // job applied

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

        app.get('/appliedJobs', verifyToken, async (req, res) => {
            try {
                const Email = req.query.applicantEmail;
                console.log("email", Email)

                if (req.user.email !== req.query.applicantEmail) {
                    return res.status(403).send({ message: 'forbidden access' })
                }

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