var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var mongo = require('./src/db/mongo');
var enums = require('./src/enums');
var messageHandler = require('./src/message/messageHandler');
const asyncHandler = require('express-async-handler');

// parse application/json
app.use(bodyParser.json())

var port = process.env.PORT || 3000;

var userList = [];

app.get('/', (req, res) => {
    res.send("Welcome to Ayva-chat.");
});

app.post('/login', asyncHandler(async (req, res) => {
    var alreadyExistingUser = userList.find(user => user.userName === req.body.userName);
    if (!alreadyExistingUser) {
        let dbResponse = await mongo.dbLogin(req);
        let message = messageHandler.enumToText(dbResponse);
        res.status(message.httpCode).send({ Code: message.errorCode, Text: message.text });
    } else {
        var socket = io.sockets.connected[alreadyExistingUser.socketId];
        var sendMessage = { message: "User is already logged in." }
        if (socket) {
            socket.emit('multipleLogin', sendMessage);
        }
        res.status(enums.HTTP_CODES.ERROR).send(sendMessage);
    }
}));

app.post('/register', asyncHandler(async (req, res) => {
    let dbResponse = await mongo.dbRegister(req)
    let message = messageHandler.enumToText(dbResponse);
    res.status(message.httpCode).send({ Code: message.errorCode, Text: message.text });
}));

app.post('/blockUser', asyncHandler(async (req, res) => {
    let dbResponse = await mongo.dbBlockUser(req)
    let message = messageHandler.enumToText(dbResponse);

    if (message.httpCode === enums.HTTP_CODES.OK) {
        var blockedUser = userList.find(user => user.userName === req.body.blockedUsername);
        if (blockedUser) {
            var socket = io.sockets.connected[blockedUser.socketId];
            var sendMessage = { message: "User is already logged in." }
            if (socket) {
                socket.emit('multipleLogin', sendMessage);
            }
        }
    }

    res.status(message.httpCode).send({ Code: message.errorCode, Text: message.text });
}));

io.on('connection', function (socket) {
    socket.on('newUser', function (data) {
        let newUser = { socketId: socket.id, userName: user }
        onlineUsers.push(newUser)
        io.emit('onlineUsers', onlineUsers);
    });

    socket.on('sendMessage', async function (data) {
        let dbResponse = await mongo.dbSaveMessage(data);
        let message = messageHandler.enumToText(dbResponse);
        if (message.httpCode === enums.HTTP_CODES.OK) {
            let socketId = '';
            onlineUsers.forEach(function (user) {
                if (user.name === data.receiverName) {
                    socketId = user.id
                }
            })
            io.to(socketId).emit('getMessage', encryptedData)
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(port, function () {
    console.log('ayva is on port:' + port);
});