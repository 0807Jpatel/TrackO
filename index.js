'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const shippo = require('shippo')('shippo_test_9242150eb19db0bdb56cbd0f0943a8690f43232a');

const app = express();
app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send("I am a chatbot");
});

let token = "EAADZAMn0RmeUBAPshtnIbR1vM89ZCKzofBpkvlVIQ0RZBkZA8UGe6u88HYkPLXVXZAyGOouuSgwUZATDqlxBgz4K9qvX0SVJ6ZAXvY9oexWZBBxmsPzQmr3HKj5WoWTcvVf28Ikztv4TICqqhRjlZCCFlAu2v30rs9oXw8KyyH2IXjAZDZD"


app.get('/webhook/', function(req, res){
    if(req.query['hub.verify_token'] == "ReserveM#R00m"){
        res.send(req.query['hub.challenge']);
    }
    res.send("Wrong Token");
});

app.post('/webhook/', function(req, res){
    let message_events = req.body.entry[0].messaging;
    for(let i = 0; i < message_events.length; i++){
        let event = message_events[i];
        let sender = event.sender.id;
        if(event.message && event.message.text){
            let text = event.message.text;
            sendText(sender, text);
        }
    }
    res.sendStatus(200);
});

function sendText(sender, text){
    let messageData = {text: text};
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {access_token: token},
        method: "POST",
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, function(error, response, body){
        if(error){
            console.log("sending error");
        }else if(response.body.error){
            console.log('response body error');
        }
    })
};


// app.get('/packageUpdate/', function(req, res){
//     sendText(sender, "LOL it worked :)");
// })

app.post('/packageUpdate/', function(req, res){
    sendText( 1386905277995957 , "something updated");
    req.on('data', function(data){
        console.log(data);
    })
    res.sendStatus(200);
});




app.listen(app.get('port'), function(){
    console.log("running Port");
});
