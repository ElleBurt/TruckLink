var bodyParser = require('body-parser')
const mongoose = require('mongoose');
require('dotenv').config();
const Schema = mongoose.Schema;
const express = require('express');

const app = express();


app.use(express.static("public"));
app.use(require('./routes/gatherData'));
app.use(require('./routes/index'));
app.use( bodyParser.json() );  
app.use(bodyParser.urlencoded({extended: true}));

const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);



// https://www.christian-schneider.net/CrossSiteWebSocketHijacking.html
io.use((socket, next) => {
  let clientId = socket.handshake.auth.token;
  console.log(`clientId = ${clientId}`);
  console.log(`cookie = ${socket.handshake.headers.cookie}`);
  if (process.env.TL_client || process.env.TL_backend) { 
    return next(); 
  } else {
    return next(new Error('Authentication Error!'));
  }
})

io.on('connection', (socket) => {
  console.log('An authenticated client connected. ');

  socket.on('jobData', (clientData) => {
    socket.emit('serverToClient', 'RECEIVED_JOB');
    io.emit('job', clientData);
  });

  socket.on('jobDeliveryData', (clientData) => {
    socket.emit('serverToClient', 'DELIVERED_JOB');
    io.emit('jobDelivery', clientData);
  });

  socket.on('eventData', (clientData) => {
    
    socket.emit('serverToClient', 'RECEIVED_EVENT');
    io.emit('event', clientData);
  });

  socket.on('dashboardData', (clientData) => {
    socket.emit('serverToClient', 'RECEIVED_DASHBOARD');
    io.emit('dashboard', clientData);
  });

  socket.on('disconnect', () => {
    console.log('An authenticated client disconnected.');
  });
});




const port = process.env.PORT || 5000;
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
