var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(express.json());
router.use(bodyParser.urlencoded({extended: true}));
const mongoose = require('mongoose');
require('dotenv').config();
const Schema = mongoose.Schema;

var bcrypt = require('bcrypt');

const saltRounds = 10;
const secretAuthKey = process.env.Super_Secret_Key;
const jwt = require('jsonwebtoken');


function generateAuthToken(username) {
    return jwt.sign(
        {
            id: 1,
            username: username
        },
        secretAuthKey,
        { expiresIn: '3h'}
    );
}

function authenticateToken(request, response, next) {
    const authToken = request.header('cookie')?.split('tljwt=')[1];

    if (!authToken) { return response.sendStatus(401); }
    jwt.verify(authToken, secretAuthKey, (error, user) => {
        if(error) { return response.sendStatus(403); }

        request.user = user;
        next();
    })

}

router.post('/api/auth', async (request, response) => {
    
    let username = request.body.username;
    let password = request.body.password;

    const hash = await bcrypt.hash(password, saltRounds);
    const passwordValid =  await bcrypt.compare(process.env.password, hash);
    
    if(username === process.env.username && passwordValid) {
        // is successful credential input
        const authToken = generateAuthToken(username);
        response.cookie('tljwt', authToken, {httpOnly: true, maxAge: 10800000});
        return response.sendStatus(200);
    } else {
        return response.sendStatus(403);
    }
        
});


router.get('/dash', authenticateToken, function(request, response) {
    console.log('USER LOGGED IN', request.user);
    response.sendFile('/app/dash.html');
})


///Mongoose Stuff Below

async function connect(){
    try{
      await mongoose.connect(process.env.MONGODB_URI || process.env.uri);
      console.log("Connected to MongoDB")
  
    }catch(error){
      console.error(error)
    }
  }
  
  connect();
  
  const LiveDataSch = new Schema({
    dataValue: String,
    value: Number,
  });
  
  const collection = mongoose.model('LiveData', LiveDataSch)
  
  let doesExist;
  
  async function exists(){
    doesExist = await collection.exists({ dataValue: 'Distance' });
    if (!doesExist) {
      // Document doesn't exist, create it
      let Distance_Covered = new collection({
        dataValue: "Distance",
        value: 0,
      });
      await Distance_Covered.save();
    } else {
      // Document exists, do something else
    }
    
    doesExist = await collection.exists({ dataValue: 'Delivery' });
    if (!doesExist) {
      // Document doesn't exist, create it
      let Deliveries_Completed = new collection({
        dataValue: "Delivery",
        value: 0,
      });
      await Deliveries_Completed.save();
    } else {
      // Document exists, do something else
    }
  }
  
  exists()
  
  const changeStream = collection.watch();
  
  // Start listening to changes
  changeStream.on('change', (change) => {
    console.log(change); // You could parse 'change' to see what has changed and act accordingly
  
    // For example, if 'Distance' value is updated
    if (change.operationType === 'update' && change.updateDescription.updatedFields.dataValue === 'Distance') {
      console.log('Distance value has been updated.');
      // Call your function here
    }
  });
  
  
  
  ///Mongoose Stuff Over

router.get('/delivery', async function(req, res) {
    await collection.updateOne({dataValue: "Delivery"}, { $inc: { value: 1 } });
    return res.send(200);
  });

router.get('/distance', async function(req, res) {
  await collection.updateOne({dataValue: "Distance"}, { $inc: { value: req.query.param } });
  return res.send(200);
});


router.get('/frontstats', function(req, res) {
  collection.find({}).then(docs => {
    res.json(docs[req.query.param].value);
  }).catch(err => {
    // handle error
  });
});

module.exports = router;