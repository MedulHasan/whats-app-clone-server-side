const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
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
        console.log("Database connected");

        app.post("/user", async (req, res) => {
            const { fullName, email, password } = req.body;
            const image = req.files.image;
            const imageData = image.data;
            const encodedData = imageData.toString("base64");
            const imageBuffer = Buffer.from(encodedData, "base64");
            const user = {
                fullName,
                email,
                password,
                image: imageBuffer,
            };
            const result = await userCollection.insertOne(user);
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
