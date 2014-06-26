(function () {

  // $.ajax({
  //   url: '/match',
  //   data: {
  //     likes: JSON.parse('{"photographer":3,"organization":19,"concert venue":19,"artist":20,"community":18,"event":7,"musician/band":181,"movie":12,"museum/art gallery":1,"art gallery":4,"modern art museum":1,"media/news/publishing":5,"company":12,"comedian":1,"publisher":2,"library":1,"copying & printing":1,"record label":11,"club":5,"nightlife":5,"magazine":3,"radio station":9,"university":1,"college & university":2,"youth organization":2,"night club":3,"non-profit organization":21,"website":6,"bar":18,"cafe":7,"arts/entertainment/nightlife":10,"restaurant/cafe":4,"food & restaurant":2,"product/service":12,"local business":16,"advertising agency":2,"clothing":6,"entertainer":5,"public figure":1,"tv show":2,"book store":1,"comic book store":1,"music store":2,"clothing supply & distribution":1,"arts & entertainment":6,"sports & recreation":1,"playlist":1,"fireworks retailer":1,"graphic design":3,"web design":4,"pet":1,"food/beverages":4,"clothing store":2,"retail and consumer merchandise":2,"laundromat":1,"hair salon":1,"app page":4,"church/religious organization":1,"internet/software":9,"arcade":1,"coffee shop":2,"tourist information":1,"concert tour":5,"musical genre":10,"producer":1,"shopping/retail":5,"market":1,"shopping mall":1,"vintage store":1,"furniture":1,"video games":1,"sports event":1,"consulting/business services":2,"education website":1,"news/media website":1,"landmark":1,"school":2,"museum":2,"hotel":4,"women\'s clothing store":1,"men\'s clothing store":1,"event planning/event services":2,"dj":1,"food/grocery":1,"food & grocery":1,"camp":2,"arts/humanities website":2,"community organization":1,"cars":1,"entertainment website":4,"pub":1,"food & beverage service & distribution":1,"bar & grill":1,"gift shop":1,"professional services":2,"book":3,"author":7,"writer":1,"musical instrument store":1,"doctor":1,"education":2,"shopping & retail":1,"bakery":1,"web development":2,"marketing consultant":1,"internet service provider":1,"meeting room":1,"actor/director":1,"caterer":1,"cupcake shop":1,"small business":2,"legal/law":2,"computers/technology":1,"musical instrument":1,"outdoor gear/sporting goods":1,"outdoors":1,"bike shop":1,"movie genre":1,"interest":1,"computers/internet website":1}'),
  //     count: 500
  //   },
  //   type: 'POST',
  //   success: function (data) {
  //     console.log(data);
  //   }
  // });

  $('.fb-login').on('click', function (e) {
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
        success: function (data) {
          console.log(data);
        }
      });
    }
  }

})();
