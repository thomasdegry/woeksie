var express = require('express'),
    app = express(),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    server = require('http').createServer(app);

server.listen(1337, function() {
    console.log('Listening on port 1337')
});

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Routes
app.get('/', function (req, res) {
    res.sendfile('public/index.html');
});

app.post('/users/:id', function(req, res) {
    var output = {};
        output.id = req.params.id;
    res.send(JSON.stringify(output));
});

app.post('/users/:id/likes', function(req, res) {

});
