'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send("Hi I am TrackO");
});

app.get('/webhook/', function(req, res){
    if(req.query['hub.verify_token'] == "ReserveM#R00m"){
        res.send(req.query['hub.challenge']);
    }
    res.send("Wrong Token");
});

app.listen(app.get('port'), function(){
    console.log("running Port");
});
