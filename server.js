var express = require('express'),
    app = express(),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    server = require('http').createServer(app),
    config = JSON.parse(fs.readFileSync('config.json')),
    dorms = JSON.parse(fs.readFileSync('data/rated-dorms.json'));

server.listen(1337);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Routes
app.get('/', function (req, res) {
    res.sendfile('public/index.html');
});

app.post('/match', function (req, res) {
    var userRating = {},
        userRatingOrder = [],
        userLikes = req.body.likes,
        count = 0;

    for (var rating in config.categories) {
        userRating[rating] = userRating[rating] || 0;

        var categories = config.categories[rating].facebook.join(';');

        for (var category in userLikes) {
            if (categories.indexOf(category) >= 0) {
                userRating[rating] += 1;
                count++;
            }
        }
    }

    for (var rating in userRating) {
      userRating[rating] = Math.round(userRating[rating] / count * 10000) / 10000;
    }

    for (var rating in userRating) {
      var sort = Math.round(userRating[rating] * 10000);

      if (!!userRatingOrder[sort] && userRatingOrder[sort] !== 'undefined') {
        userRatingOrder[sort] += ';' + rating;
      } else {
        sort = Math.round(sort);
        userRatingOrder[sort] = rating;
      }
    }

    var orderString = userRatingOrder.reverse().join(';').replace(/;{2,}/g, ';'),
        separatorCount = 0,
        topThree = '';

    for (var i = 0; i < orderString.length; i++) {
        if (orderString[i] === ';') {
            separatorCount++;

            if (separatorCount === 3) {
                topThree = orderString.substring(0, i).split(';');
                break;
            }
        }
    };

    var results = [];

    console.log(userRating);

    for (var i = 0; i < dorms.length; i++) {
        var dorm = dorms[i];

        // if (
        //     dorm.order.indexOf(topThree[0] + ';' + topThree[1] + ';' + topThree[2]) < 0
        //  || dorm.order.indexOf(topThree[0] + ';' + topThree[2] + ';' + topThree[1]) < 0
        //  || dorm.order.indexOf(topThree[1] + ';' + topThree[0] + ';' + topThree[2]) < 0
        //  || dorm.order.indexOf(topThree[1] + ';' + topThree[2] + ';' + topThree[0]) < 0
        //  || dorm.order.indexOf(topThree[2] + ';' + topThree[1] + ';' + topThree[0]) < 0
        //  || dorm.order.indexOf(topThree[2] + ';' + topThree[0] + ';' + topThree[1]) < 0) {
        //     results.push(dorm);
        //  }
        if (
            dorm.order.indexOf(topThree[0] + ';' + topThree[1] + ';' + topThree[2]) !== -1
         || dorm.order.indexOf(topThree[0] + ';' + topThree[2] + ';' + topThree[1]) !== -1
         || dorm.order.indexOf(topThree[1] + ';' + topThree[0] + ';' + topThree[2]) !== -1
         || dorm.order.indexOf(topThree[1] + ';' + topThree[2] + ';' + topThree[0]) !== -1
         || dorm.order.indexOf(topThree[2] + ';' + topThree[1] + ';' + topThree[0]) !== -1
         || dorm.order.indexOf(topThree[2] + ';' + topThree[0] + ';' + topThree[1]) !== -1) {
            results.push(dorm);
         }
    }

    res.send(JSON.stringify(results));
});
