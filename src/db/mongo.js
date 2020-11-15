const mongoUrl = "mongodb+srv://all-for-the-hell-of-it:yYpDBVzFfSTb8H6g@ayva-chat-cluster.nv3ei.mongodb.net/<dbname>?retryWrites=true&w=majority"
const MongoClient = require('mongodb').MongoClient;
var enums = require('../enums');
Promise = require('promise');

async function dbLogin(req) {
    return new Promise(function (resolve, reject) {
        var res = {status: enums.DB_CODES.OK}
        MongoClient.connect(mongoUrl, function (err, db) {
            if (err) throw err;
            var dbo = db.db("ayva-chat");
            dbo.collection("users").findOne({ userName: req.body.userName, password: req.body.password }, function (err, result) {
                var logObj = { operation: "login", status: "success", text: "userId: " + req.body.userName, date: new Date() };
                if (err || !result) {
                    logObj.status = "failure";
                    res.status = enums.DB_CODES.NOT_FOUND;
                };
                dbo.collection("logs").insertOne(logObj, function (err, res) {
                    if (err) throw err;
                });
                db.close();
                resolve(res.status);
            });
        });
    })
}

async function dbRegister(req) {
    return new Promise(function (resolve, reject) {
        var res = {status: enums.DB_CODES.OK}
        MongoClient.connect(mongoUrl, function (err, db) {
            if (err) throw err;
            var dbo = db.db("ayva-chat");
            var myObj = { userName: req.body.userName, password: req.body.password, blockedUsers: [] };
            dbo.collection("users").findOne({ userName: req.body.userName }, function (err, result) {
                var logObj = { operation: "register", status: "success", text: "userId: " + req.body.userName };
                if (err || result) {
                    logObj.status = "failure";
                    res.status = enums.DB_CODES.ALREADY_EXISTS;
                } else {
                    dbo.collection("users").insertOne(myObj, function (err, res) {
                        if (err) throw err;
                    });
                }
                dbo.collection("logs").insertOne(logObj, function (err, res) {
                    if (err) throw err;
                });
                db.close();
                resolve(res.status);
            });
        });
    })
}

async function dbBlockUser(req) {
    return new Promise(function (resolve, reject) {
        var res = {status: enums.DB_CODES.OK}
        MongoClient.connect(mongoUrl, function (err, db) {
            if (err) throw err;
            var dbo = db.db("ayva-chat");
            var blockedObj = { userName: req.body.userName, blockedUsername: req.body.blockedUsername }
            dbo.collection("users").updateOne({ userName: blockedObj.userName }, { $push: { blockedUsers: blockedObj.blockedUsername } }, function (err, result) {
                if (err) throw err;
                db.close();
                resolve(res.status);
            });
        });
    })
}

async function dbSaveMessage(data) {
    return new Promise(function (resolve, reject) {
        var res = {status: enums.DB_CODES.OK}
        MongoClient.connect(mongoUrl, function (err, db) {
            if (err) throw err;
            var dbo = db.db("ayva-chat");
            var myObj = { fromUserName: data.fromUserName, toUserName: data.toUserName, chatHistory: [] };
    
            dbo.collection("chat").findOne({ fromUserName: myObj.fromUserName, toUserName: myObj.toUserName }, function (err, result) {
                var messageObject = { userName: data.fromUserName, message: data.message, date: new Date() }
                if (err || !result) {
                    myObj.chatHistory.push(messageObject)
                    dbo.collection("chat").insertOne(myObj, function (err, res) {
                        if (err) throw err;
                    });
                } else {
                    dbo.collection("chat").updateOne({ fromUserName: myObj.fromUserName, toUserName: myObj.toUserName }, { $push: { chatHistory: messageObject } }, function (err, res) {
                        if (err) throw err;
                    });
                }
                db.close();
                resolve(res.status);
            });
        });
    })
}

module.exports.dbLogin = dbLogin;
module.exports.dbRegister = dbRegister;
module.exports.dbBlockUser = dbBlockUser;
module.exports.dbSaveMessage = dbSaveMessage;