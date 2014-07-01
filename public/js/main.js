(function () {

  $('#schoolform').on('submit', function (e) {
    e.preventDefault();
    checkLoginState();
  });

  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  function statusChangeCallback(response) {
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      getLikes();
    } else {
      login();
    }
  }

  function login() {
    FB.login(function(response) {
      getLikes();
    }, {scope: 'email, user_likes'});
  }

  function getLikes (next) {
    if (next === undefined) {
      next = '/me/likes?limit=100';
    }

    FB.api(next, function(response) {
      processLikes(response);
    });
  }

  var likes = {},
      likesCount = 0;

  function processLikes (response) {
    for (var i = 0; i < response.data.length; i++) {
      var like = response.data[i],
          category = like.category.toLowerCase();

      likes[category] = likes[category] + 1 || 1;
      likesCount++;

      if (!!like.category_list) {
        for (var j = 0; j < like.category_list.length; j++) {
          var subcategory = like.category_list[j].name.toLowerCase();
          likes[subcategory]= likes[subcategory] + 1 || 1;
          likesCount++;
        }
      }
    }

    if (response.data.length >= 100 && !!response.paging.next) {
      getLikes(response.paging.next);
    } else {
      console.log(likes);
      console.log('Got all likes, send to server to find match');
      $.ajax({
        url: '/match',
        data: {
          likes: likes,
          count: likesCount
        },
        type: 'POST',
        dataType: 'JSON',
        success: function (data) {
          $('section').addClass('out');
          setTimeout(function () {
            $('.container').hide();
            $('.fullscreen-container').fadeIn(220);
            var mapOptions = {
              center: new google.maps.LatLng(50.8305, 3.2645),
              zoom: 13
            };
            var map = new google.maps.Map(document.getElementById("map-canvas"),
                mapOptions);

            for (var i = 0; i < data.length; i++) {
              if (data[i].address.indexOf('null') !== 0) {
                $('#results').append('<li><span class="address">' + data[i].address + '</span><span class="rooms">' + data[i].rooms + ' kamers</span>');

                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(data[i].location.lat, data[i].location.long),
                    map: map,
                    title: data[i].address
                });
              }
            }
          }, 500);
        }
      });
    }
  }

})();
