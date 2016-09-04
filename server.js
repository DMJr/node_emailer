var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function(req, res) {
    res.send('Return JSON or HTML View');
});

app.get('/read-q', function(req,res) {
    console.log(req.query);
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

function checkWhiteListedDomains(req, res, next) {
    var originDomain = req.get('origin');

    function containsDomain(domain, index, array) {
      return originDomain.indexOf(domain) > -1;
    }

    if (!(['jsbin', 'liftgateme'].some(containsDomain))) {
        return;
    }
    next();
}

app.post('/send-msg', checkWhiteListedDomains, function(req, res) {
    // load aws sdk
    var aws = require('aws-sdk');
        aws.config.loadFromPath('config.json'), // load aws config
        ses = new aws.SES({apiVersion: '2010-12-01'}), //load AWS SES

        // https://jsbin.com/hixanogija/edit?html
        // exPostContent = {
        //     "toEmail": "liftgates@gmail.com",
        //     "fromEmail":"liftgates@gmail.com",
        //     "senderName": "Micky",
        //     "contactEmail": "mmouse@dis.com",
        //     "contactPhone": "7742663297",
        //     "senderMsg": "Hello there!  I want a liftgate now!"
        // }
        to = ['liftgates@gmail.com'],
        from = 'liftgates@gmail.com',
        params = req.body,
        defaultVal = 'Not Provided',
        senderName = params.name || defaultVal,
        toEmail = [params.toEmail] || ['liftgates@gmail.com'],
        fromEmail = params.fromEmail || defaultVal,
        contactEmail = params.contactEmail || defaultVal,
        contactPhone = params.contactPhone || defaultVal,
        senderMsg = params.senderMsg || defaultVal;

    if (!toEmail && !fromEmail) {
        return;
    }

    // this sends the email  @todo - add HTML version
    ses.sendEmail( { 
       Source: fromEmail, 
       Destination: { ToAddresses: toEmail },
       Message: {
           Subject: {
              Data: contactEmail
           },
           Body: {
               Text: {
                   Data: senderMsg,
               }
            }
       }
    }
    , function(err, data) {
        if(err) throw err
            console.log('Email sent:');
            console.log(data);
     });

    console.log('msg sent');
    res.send('Send msg route');
});

app.listen(3001);
console.log('Listening on port 3001...');
