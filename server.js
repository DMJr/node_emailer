var express = require('express');
var app = express();

app.get('/', function(req, res) {
    res.send('Return JSON or HTML View');
});

app.get('/send-msg', function(req, res) {
    // load aws sdk
    var aws = require('aws-sdk');

    // load aws config
    aws.config.loadFromPath('config.json');

    // load AWS SES
    var ses = new aws.SES({apiVersion: '2010-12-01'});

    // send to list
    var to = ['liftgates@gmail.com'];

    // this must relate to a verified SES account
    var from = 'liftgates@gmail.com';

    // this sends the email
    // @todo - add HTML version
    ses.sendEmail( { 
       Source: from, 
       Destination: { ToAddresses: to },
       Message: {
           Subject: {
              Data: 'A Message To You buddy'
           },
           Body: {
               Text: {
                   Data: 'Stop your messing around',
               }
            }
       }
    }
    , function(err, data) {
        if(err) throw err
            console.log('Email sent:');
            console.log(data);
     });


    // var nodemailer = require('nodemailer');
    // var transporter = nodemailer.createTransport();
    // var options = {
    //    from: 'dave@adsf.com',
    //    to: 'liftgates@gmail.com',
    //    subject: 'hello',
    //    html: '<b>hello world!</b>',
    //    text: 'hello world!'
    // },
    // mailCallback = function (error, info){
    //     if(error){
    //         return console.log('error : ', error);
    //     }
    //     console.log('Message sent: ' + info);
    // };

    // transporter.sendMail(options, mailCallback);

    console.log('msg sent');
    res.send('Send msg route');
});

app.listen(3001);
console.log('Listening on port 3001...');
