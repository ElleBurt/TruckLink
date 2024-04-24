var express = require('express');
var bodyParser = require('body-parser')
var router = express.Router();


router.use(bodyParser.urlencoded({ extended: false }));




router.get('/', function(request, response){
    response.sendFile('/app/index.html');
});


module.exports = router;