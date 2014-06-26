(function() {

  $('.fb-login').click(function(e) {
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
      $.ajax({
        type: 'POST',
        url: '/users/' + response.authResponse.userID,
        dataType: 'JSON',
        success: function(data) {
          console.log(data);
          getLikes();
        },
        error: function(data) {
          console.log('error');
        }
      });
    }, {scope: 'email, user_likes'});
  }

  function getLikes(nexturl) {
    if(nexturl === undefined) nexturl = '/me/likes?limit=100';
    console.log('Welcome!  Fetching your information.... ');
    
    FB.api(nexturl, function(response) {
      processLikes(response);
    });
  }

  var likes = [];
  function processLikes(response) {
    for(var i = 0; i < response.data.length; i++) {
      likes.push(response.data[i]);
    }

    if(response.data.length >= 100) {
      getLikes(response.paging.next);
    }

    console.log(likes);
  }
})();