var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars'); //https://github.com/ericf/express-handlebars

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function(req, res) {
    res.send('Return JSON or HTML View');
});

app.get('/lgm-contact-form', function(req,res) {
    res.render('contactUs');
});

app.get('/pickup-liftgate-quote', function(req,res) {
    res.render('pickupLiftgateQuote');
});

function checkWhiteListedDomains(req, res, next) {
    var originDomain = req.get('origin');

    function containsDomain(domain, index, array) {
      console.log(domain, originDomain);
      return originDomain.indexOf(domain) > -1;
    }

    if (!(['shielded-wave-41905.herokuapp', 'localhost', 'jsbin', 'liftgateme', 'www.liftgateme.com'].some(containsDomain))) {
        return;
    }
    next();
}

app.post('/send-msg', checkWhiteListedDomains, function(req, res) {
    var aws = require('aws-sdk');

    var ses;

    if (process && process.env && process.env.isHeroku) {
        var aki = process.env.accessKeyId,
            sak = process.env.secretAccessKey,
            reg = process.env.region;

      aws.config.update({
        accessKeyId: aki,
        secretAccessKey: sak,
        region: reg
      });
    } else {
        aws.config.loadFromPath('config.json'); // load aws config
    }

    ses = new aws.SES({apiVersion: '2010-12-01'}); //load AWS SES

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
        console.log('FAILING');
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
     });

    console.log('msg sent');
    res.send('Send msg route');
});

app.listen(process.env.PORT || 3001);
console.log('Listening on port %s', (process.env.PORT || 3001));
