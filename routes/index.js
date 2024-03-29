var express = require('express');
var router = express.Router();
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.mongo_path;
let database
let collection;
(async function () {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  database = client.db('quickstartDB');
})();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET about page. */
router.get('/about', function (req, res, next) {
  res.send('about');
});


router.get('/mongodb/api/endpoint', async (req, res) => {
  // console.log('Loading:');
  try {
    const collection = database.collection('streams');
    const cursor = await collection.find({});
    const documents = await cursor.toArray();
    // console.log('Documents retrieved:', documents);
    res.json(documents);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Error retrieving data from MongoDB' });
  }
});

router.get('/mongodb/api/get/:userId/data', async (req, res) => {
  try {
    const userId = req.params.userId;

    const collectionName = `data_${userId}`;
    const collection = database.collection(collectionName);

    // Retrieve all documents from the collection
    const cursor = await collection.find({});
    const documents = await cursor.toArray();

    res.status(200).json(documents);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Error retrieving data from MongoDB' });
  }
});

router.post('/mongodb/api/post/:userId/data', async (req, res) => {
  try {
    const userId = req.params.userId;
    const activities = req.body;

    const collectionName = `data_${userId}`;
    const collection = database.collection(collectionName);
    
    for (const activity of activities) {
      // Construct a document with the activity ID as the key
      const document = { _id: activity.id, data: activity };
      
      await collection.updateOne(
        { _id: document._id }, // Match documents by _id
        { $set: document },    // Set the entire document
        { upsert: true }       // Perform an upsert operation
      );
    }
    res.status(201).json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).json({ error: 'Error inserting data into MongoDB' });
  }
});

router.get('/mongodb/api/findone/:userId/:key', async (req, res) => {
  try {
    const userId = req.params.userId;
    const activityId = req.params.key;

    console.log("De activityId:: ", activityId)

    const collectionName = `streams_${userId}`;
    const collection = database.collection(collectionName);
    const stream = await collection.findOne({ _id: activityId });
    if (stream) {
      res.json(stream.data);
    } else {
      res.status(404).json({ message: 'stream not found' });
    }
  } catch (error) {
    // If an error occurs, send a 500 Internal Server Error response
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/mongodb/api/post/:userId/:key', async (req, res) => {
  try {
    const userId = req.params.userId;
    const yourCustomKey = req.params.key;
    const data = req.body;

    const collectionName = `streams_${userId}`;
    const collection = database.collection(collectionName);
    
    const document = { _id: yourCustomKey, data };
    const objectInDB = await collection.findOne({ _id: yourCustomKey });

    if (objectInDB) {
      // console.log("already in DB: ")
    } else {
      // console.log("not in DB yet: ")
      await collection.updateOne(
        { _id: document._id }, // Match documents by _id
        { $set: document },    // Set the entire document
        { upsert: true }       // Perform an upsert operation
      );
    }
    res.status(201).json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).json({ error: 'Error inserting data into MongoDB' });
  }
});

module.exports = router;
