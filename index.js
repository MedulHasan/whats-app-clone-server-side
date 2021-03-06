const express = require("express");
const cors = require("cors");
const { MongoClient, CURSOR_FLAGS } = require("mongodb");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const port = process.env.PORT || 8888;
const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y6hb5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(cors());
app.use(express.json());
app.use(fileUpload());

async function run() {
    try {
        await client.connect();
        const database = client.db("whatsAppClone");
        const userCollection = database.collection("users");
        const conversationCollection = database.collection("conversation");
        const messageCollection = database.collection("messages");
        console.log("Database connected");

        // display message
        app.get("/displayMessage/:conversationId", async (req, res) => {
            const conversationId = req.params.conversationId;
            const query = {
                conversationId,
            };
            const cursor = messageCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        });

        // store conversation
        app.post("/storeConversation", async (req, res) => {
            const textDetails = req.body;
            const result = await messageCollection.insertOne(textDetails);
            res.json(result);
        });

        app.get("/conversation/:email", async (req, res) => {
            const email = req.params.email;

            const query = {
                $or: [
                    { "creator.email": email },
                    { "participant.email": email },
                ],
            };
            const cursor = conversationCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        });

        app.post("/createConversation", async (req, res) => {
            const { creator, participant } = req.body;
            const createConversation = {
                creator,
                participant,
            };
            const result = await conversationCollection.insertOne(
                createConversation
            );
            res.json(result);
        });

        app.get("/users", async (req, res) => {
            const cursor = userCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });
        app.get("/user/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            res.json(result);
        });

        app.post("/user", async (req, res) => {
            const { fullName, email, imageURL } = req.body;
            // const image = req.files.image;
            // const imageData = image.data;
            // const encodedData = imageData.toString("base64");
            // const imageBuffer = Buffer.from(encodedData, "base64");
            const user = {
                fullName,
                email,
                imageURL,
            };
            const result = await userCollection.insertOne(user);
            res.json(result);
        });
        app.put("/user", async (req, res) => {
            const data = req.body;
            const filter = { email: data.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: data,
            };
            const result = await userCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.json(result);
        });
    } finally {
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("whats app clone");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
