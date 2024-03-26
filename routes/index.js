var express = require('express');
var router = express.Router();
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.mongo_path;
let collection;
(async function () {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const database = client.db('quickstartDB');
  collection = database.collection('streams');
})();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.send('about');
});


router.get('/mongodb/api/endpoint', async (req, res) => {
  // console.log('Loading:');
  try {
      const cursor = await collection.find({});
      const documents = await cursor.toArray();
      // console.log('Documents retrieved:', documents);
      res.json(documents);
  } catch (error) {
      console.error('Error retrieving data from MongoDB:', error);
      res.status(500).json({ error: 'Error retrieving data from MongoDB' });
  }
});

router.get('/mongodb/api/findone/:key', async (req, res) => {
  const activityId = req.params.key;
  console.log("De activityId:: ", activityId)
  try {
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

router.post('/mongodb/api/post/:key', async (req, res) => {
  try {
      const yourCustomKey = req.params.key;
      const data = req.body; // Assuming data is sent in the request body

      // console.log(yourCustomKey)
      const document = { _id: yourCustomKey, data };
      const objectInDB = await collection.findOne({ _id: yourCustomKey });

      if (objectInDB) {
          // console.log("already in DB: ")
      } else {
          // console.log("not in DB yet: ")
          const result = await collection2.updateOne(
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
