'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const shippo = require('shippo')('shippo_live_3ccdf00e58f16fec2e2792eeeb758412bf19bb52');

const app = express();
app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: true}));
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
    let reg = /^[a-zA-Z0-9]+ [a-zA-Z]+$/;
    let message_events = req.body.entry[0].messaging;
    for(let i = 0; i < message_events.length; i++){
        let event = message_events[i];
        let sender = event.sender.id;
        if(event.message && event.message.text){
            let text = event.message.text;
            if(text.match(reg)){
                let splits = text.split(" ");
                let TNs = splits[0];
                let carrier = splits[1];
                // shippo.track.get_status(carrier, TNs)
                // .then(function(status) {
                //     if(status.tracking_status != null){
                //         sendText(sender, status.tracking_status.status_details);
                //     }else{
                //         sendText(sender, "I wasn't able to find infomation associated with information, please check information and try again");
                //     }
	            //         sendText(sender, info);
                // }, function(err) {
	            //         sendText(sender, "There was an error retrieving tracking information");
                // });
                var webhookInfo = {
                    "carrier": carrier,
                    "tracking_number": TNs,
                    "metadata": sender
                }

                shippo.track.create(webhookInfo)
                .then(function(status){
                    if(status.tracking_status != null){
                        sendStatus(sender, status);
                        // sendText(sender, status.tracking_status.status_details);
                    }else{
                        sendText(sender, "I wasn't able to find infomation associated with information, please check information and try again");
                    }
                }, function(err){
                    sendText(sender, "There was an error retrieving tracking information");
                })


            }else{
                sendText(sender, "I wasn't able to understand what you said, please try again.\nTo track package Enter your tracking number and carrier followed by space");
            }
            
        }
    }
    res.sendStatus(200);
});

function sendText(sender, text){
    let messageData = {text: text};
    sendMD(sender, messageData);
};



function sendStatus(sender, status){
    let address = status.tracking_status.location.city + "," + status.tracking_status.location.state + ","+ status.tracking_status.location.state;
    address = address.replace(" ", "+");
    let urls = "https://maps.googleapis.com/maps/api/staticmap?center=" + address + "zoom=13&size=600x300&maptype=roadmap&markers=color:red%7C" + address + "&key=AIzaSyBbteSbwdtCtWL8uy-Mz4R8JuALwToPz9g";
    let messageData = {
      "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Infomation regarding your package",
            "image_url":urls,
            "subtitle":status.tracking_status.status_details, 
          }
        ]
      }}}
      sendMD(sender, messageData);
}

function sendMD(sender, messageData){
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
}


// app.get('/packageUpdate/', function(req, res){
//     sendText(sender, "LOL it worked :)");
// })

app.post('/packageUpdate/', function(req, res){
    console.log(req.body.tracking_status.status_details);
    sendStatus( req.body.metadata , req.body)
    .then(function(status){
        res.sendStatus(200);
    });
});




app.listen(app.get('port'), function(){
    console.log("running Port");
});
