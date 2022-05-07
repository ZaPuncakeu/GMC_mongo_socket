const mongoose = require('mongoose');
const express = require('express');
const app = express();
const userModel = require('./models/user');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const server = require('http').createServer(app); // Creation du serveur avec le module http
const io = require('socket.io')(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
}); // liaison du websocket avec le serveur


const port = process.env.PORT || 4001;
server.listen(port, err => {
    if(err) throw err;
    console.log(`Server open on ${port}`);
})

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://punkek:eWQy6gNzyWWebgYD@cluster0.hkhtd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
.then(() => {
    console.log('Connected to the database');
})
.catch(err => {
    console.error(err);
})

app.post('/api/register', (req, res) => {

    // YOU MUST FIRST DO THE DATA VALIDATION

    const new_user = new userModel(req.body);
    
    new_user.save()
    .then(doc => {
        res.status(200).json(doc);
    })
    .catch(err => {
        console.error(err);
        if(err.code == 11000)
        {
            res.status(422).json({email: "Email already in use"});
            return;
        }
        res.status(500).json('Internal server error')
    })
})

app.post('/api/login', (req, res) => {
    // YOU MUST DO DATA VALIDATION FIRST

    userModel.find(req.body)
    .then((doc) => {
        if(doc.length == 0){
            res.status(404).json('Email or password incorrect');
            return;
        }
        
        const token = jwt.sign({id: doc._id}, 'mywebsite2022');
        res.status(200).json(token)
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({})    
    })
})

// let's imagine a database of messages
const messages = [];

// Connection au websocket
io.on('connection', (socket) => {
    console.log('New client connected!');
    socket.emit('recieve_message', messages);
    
    socket.on('joinRoom', roomId => {
        socket.join(roomId);
    })



    socket.on('new_message', data => {
        messages.push(data);
        socket.to(data.roomId).emit("recieve_message", messages);
        socket.emit("recieve_message", messages);
    })
})