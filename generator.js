var fs = require('fs'),
    http = require('http'),
    request = require('request'),
    options = {
      external: {
        openData: {
          url: "http://data.drk.be/kortrijk/studententenhuizen_wsg84.json",
          root: "studententenhuizen_wsg84"
        },
        facebook: {},
        foursquare: {
          url: {
            root: 'https://api.foursquare.com/v2/venues/search?v=20140626',
            authorized: function () {
              var o = options.external.foursquare;
              return o.url.root + '&client_id=' + o.client.id + '&client_secret=' + o.client.secret
            }
          },
          client: {
            id: "2M4WQEZKBAOY132GNDA5JEIYOKM5WK31EK3X1V3WT2ENFHPH",
            secret: "EI2KEOGIXI25EOVPSQFM0GM1O31SL4D14Y3JLCDJNVNW0MZ4"
          }
        }
      }
    },
    ratingConfig = {};

function loadConfig () {
  ratingConfig.raw = JSON.parse(fs.readFileSync('config.json'));
  ratingConfig.foursquare = '';

  for (var category in ratingConfig.raw.categories) {
    ratingConfig.foursquare += ',' + ratingConfig.raw.categories[category].foursquare.join(',');
  }

  ratingConfig.foursquare = ratingConfig.foursquare.substring(1);
}

function fetchRawDorms (callback) {
  request(options.external.openData.url, function (err, res, body) {
    if (!err && res.statusCode === 200) {
      fs.writeFile('data/raw/dorms.json', body, function (err) {
        callback(null)
      });
    } else {
      callback('Open Data Unavailable');
    }
  });
}

function getRawDorms () {
  var rawDorms;

  fs.readFile('data/raw/dorms.json', function (err, data) {
    if (err || !data) {
      request(options.external.openData.url, function (err, res, body) {
        if (!err && res.statusCode === 200) {
          fs.writeFile('data/raw/dorms.json', body, function (err) {
            rawDorms = JSON.parse(body);
            rateDorms(rawDorms[options.external.openData.root]);
          });
        }
      });
    } else {
      rawDorms = JSON.parse(data);
      rateDorms(rawDorms[options.external.openData.root]);
    }
  });
}

function rateDorms (rawDorms, callback) {
  var dorms = [],
      checkComplete = function () {
        return dorms.length === rawDorms.length;
      };

  rawDorms.forEach(function (d) {
    var dorm = {};
    dorm.address = d.straat + ' ' + parseInt(d.huisnr, 10);
    dorm.rooms = parseInt(d.aantal_kam);
    dorm.location = {lat: d.lat, long: d.long};

    rateDorm(dorm, function (ratedDorm) {
      dorms.push(ratedDorm);

      if (checkComplete()) {
        fs.writeFileSync('data/rated-dorms.json', JSON.stringify(dorms));
      }
    });
  });
}

function rateDorm (dorm, callback) {
  var url = options.external.foursquare.url.authorized() + '&ll=' + dorm.location.lat + ',' + dorm.location.long + '&intent=browse&radius=1000&categoryId=' + ratingConfig.foursquare;

  request(url, function (err, res, body) {
    if (!err && res.statusCode === 200) {
      var raw = JSON.parse(body),
          venues = raw.response.venues,
          dormRating = {},
          dormRatingCount = 0;

      venues.forEach(function (venue) {
        var categoryID = venue.categories[0].id;

        for (var category in ratingConfig.raw.categories) {
          dormRating[category] = dormRating[category] || 0;

          ratingConfig.raw.categories[category].foursquare.forEach(function (c) {
            if (c === categoryID) {
              dormRating[category]++;
              dormRatingCount++;
            }
          });
        }
      });

      for (var rating in dormRating) {
        dormRating[rating] = Math.round(dormRating[rating] / dormRatingCount * 10000) / 10000;
      }

      dorm.rating = dormRating;

      callback(dorm);
    }
  });
}

loadConfig();
getRawDorms();
