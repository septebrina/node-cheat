/**
 * Created by Zeeshan on 8/3/2016.
 */

//------------------------------------------------------
//https basic node.js server
//Web Link=>
//Run : node server.js
//Note :
//------------------------------------------------------


var https = require('https'),
    fs = require('fs'),
    config = require('../config'),
    stripe = require('stripe')(config.STRIPE_KEY),
    ejs = require('ejs'),
    path = require('path'),
    app = require('express')();

app.set('view engine', 'ejs');


var options = {
    key: fs.readFileSync('../../HTTPS/keys/key.pem'),
    cert: fs.readFileSync('../../HTTPS/keys/cert.pem')
};

app.get('/', function (req, res) {
    //res.send('Hello World!');
    res.render('index',{message:"Hello World!"});
});

//create stripe customer
app.post('/customer', function (req, res) {
    stripe.customers.create({
            email: req.query.email || Date.now()+"@nodecheat.com",
            description: req.query.description || "Desc. for " + Date.now()+"@nodecheat.com" ,
            source: req.query.source // obtained with Stripe.js
        }, function(err, customer) {
            if(err){
                console.log("stripe.customers.create Failed ", err);
                res.send({message: "stripe.customers.create Failed ", err: err});
            }else{
                console.log("stripe.customers.create Succeeded ");
                res.send({message: "stripe.customers.create Succeeded ", customer: customer});
            }
        }
    );
});

//get customer with customer_id
app.post('/customer', function (req, res) {
    if(req.query.customer_id){
        stripe.customers.retrieve(req.query.customer_id,
            function(err, customer) {
                if(err){
                    var msg = "stripe.customers.retrieve Failed ";
                    console.log(msg, err);
                    res.send({message: msg, err: err});
                }else{
                    var msg = "stripe.customers.retrieve Succeeded ";
                    console.log(msg );
                    res.send({message: msg, customer: customer});
                }
            }
        );
    }else{
        res.send({message:"Params Missing"});
    }
});



//charge one time using token (obtained form stripe.js)
app.post('/charge-immediate', function (req, res) {
    if(req.query.token){
        stripe.charges.create({
            amount: req.query.amount,
            currency: req.query.currency || "usd",
            source: req.query.token, // obtained with Stripe.js
            description: req.query.desc,
            metadata: {'node_cheat_by': 'https://github.com/zishon89us'}
        }, function(err, charge) {
            if(err){
                var msg = "stripe.charges.create Failed ";
                console.log(msg, err);
                res.send({message: msg, err: err});
            }else{
                var msg = "stripe.charges.create Succeeded ";
                console.log(msg );
                res.send({message: msg, charge: charge});
            }
        });
    }else{
        res.send({message:"Params Missing"});
    }
});

//charge customer but don't capture
app.post('/charge-hold', function (req, res) {
    if(req.query.customer_id){
        stripe.charges.create({
            amount: req.query.amount,
            currency: req.query.currency || "usd",
            customer: req.query.customer_id, // obtained with Stripe.js
            description: req.query.desc,
            capture: false,
            statement_descriptor : "Node Cheat",
            metadata: {'node_cheat_by': 'https://github.com/zishon89us'}
        }, function(err, charge) {
            if(err){
                var msg = "stripe.charges.create Failed ";
                console.log(msg, err);
                res.send({message: msg, err: err});
            }else{
                var msg = "stripe.charges.create Succeeded ";
                console.log(msg );
                res.send({message: msg, charge: charge});
            }
        });
    }else{
        res.send({message:"Params Missing"});
    }
});

//charge one time using token
app.post('/charge-capture', function (req, res) {
    if(req.query.charge_id){
        stripe.charges.capture(req.query.charge_id, function(err, charge) {
            if(err){
                var msg = "stripe.charges.capture Failed ";
                console.log(msg, err);
                res.send({message: msg, err: err});
            }else{
                var msg = "stripe.charges.capture Succeeded ";
                console.log(msg );
                res.send({message: msg, charge: charge});
            }
        });
    }else{
        res.send({message:"Params Missing"});
    }
});

//get a charge info with ID and also bring customer associated with ti
app.get('/charge', function (req, res) {
    if(req.query.chargeId){
        stripe.charges.retrieve(req.query.chargeId, {
            expand: ["customer"]
        });
    }else{
        res.send({message:"Params Missing"});
    }
});


//Events

//get a charge info with ID and also bring customer associated with ti
app.get('/event', function (req, res) {
    if(req.query.event_id){
        stripe.events.retrieve(req.query.event_id,
            function(err, event) {
                if(err){
                    var msg = "stripe.events.retrieve Failed ";
                    console.log(msg, err);
                    res.send({message: msg, err: err});
                }else{
                    var msg = "stripe.events.retrieve Succeeded ";
                    console.log(msg );
                    res.send({message: msg, event: event});
                }
            }
        );
    }else{
        res.send({message:"Params Missing"});
    }
});



https.createServer(options, app).listen(3000, function () {
    console.log('Server Started!');
});