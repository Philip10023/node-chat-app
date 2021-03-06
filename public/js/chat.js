var socket = io();

// ** MOBILE UI/UX

var swipe = new Hammer(document);
var pan = new Hammer(document)
// detect swipe and call to a function

swipe.on('swiperight swipeleft', function(e) {
  e.preventDefault();
  if (e.type == 'swiperight') {
    // open menu
    $('#chat__sidebar').animate({
      left: '0'
    });
  } else {
    // close/hide menu
    $('#chat__sidebar').animate({
      left: '-100%'
    });
  }

});

pan.on('panright panleft', function(e) {
  e.preventDefault();
  if (e.type == 'panright') {
    // open menu
    $('#chat__sidebar').animate({
      left: '0'
    });
  } else {
    // close/hide menu
    $('#chat__sidebar').animate({
      left: '-100%'
    });
  }

});

// END MOBILE UI/UX

function scrollToBottom() {
  //Selectors
  let messages = jQuery('#messages');
  let newMessage = messages.children('li:last-child');
  //Heights
  let clientHeight = messages.prop('clientHeight');
  let scrollTop = messages.prop('scrollTop');
  let scrollHeight = messages.prop('scrollHeight');
  let newMessageHeight = newMessage.innerHeight();
  let lastMessageHeigt = newMessage.prev().innerHeight();

  if( clientHeight + scrollTop + newMessageHeight + lastMessageHeigt>= scrollHeight || scrollTop == 0 ){
    messages.scrollTop(scrollHeight);
  }
}

// ***** SocketIO Events ****

socket.on('connect', function () {

  var room_id = localStorage.getItem('room_id');
  var room_name = localStorage.getItem('room_name');
  var user_name = localStorage.getItem('user_name');
  var user_id = localStorage.getItem('user_id');
  var user_token = localStorage.getItem('user_token');


  if( !room_id || !room_name || !user_name || !user_id || !user_token) {
    alert('You have to sign in to start chatting');
    return window.location.href = '/';
  }
  var runOnce = false
  if ( $(window).width() > 739 && runOnce === true) {
    //do nothing
  }
  else {
    //let user know you can swipe right for a peoples list!

      var time = moment().valueOf()
      var formattedTime = moment(time).format('h:mm a')
      var template = jQuery('#message-template').html();
      var html = Mustache.render(template, {
        text: 'swipe right on mobile phones to see the people list!',
        from: 'Admin',
        createdAt: formattedTime
      })

      jQuery('#messages').append(html);
      scrollToBottom()
      runOnce = true
    //Add your javascript for small screens here
  }
  //Set room name
  $('#room-name').html(room_name);

  var params = {
    room_id,
    user_token
  }

  socket.emit('join', params, function(err) {
    if (err) {
      console.log('Error: ' + err);
      alert(err);
      window.location.href = '/';
    }
  });
});

socket.on('disconnect', function () {
  console.log('Disconnected from the server');
    socket.emit('leaveRoom', {
      user_name: localStorage.getItem('user_name'),
      user_id: localStorage.getItem('user_id'),
      room_id: localStorage.getItem('room_id')
    });
});

socket.on('updateUserList', function (users) {
  var ol = jQuery('<ol></ol>');
  users.forEach( function (user) {
    ol.append(jQuery('<li></li>').text(user.name));
  });

  jQuery('#users').html(ol);
});

socket.on('updateMessageList', function (messages) {
  var template = jQuery('#message-template').html();
  var messagesProcessed = 0;

  var request = messages.forEach( function (message, index) {
    var formatedTime = moment(message.createdAt).format('h:mm a');
    var html = Mustache.render(template, {
      from: message.from,
      text: message.text,
      createdAt: formatedTime,
      url: message.url
    });

    jQuery('#messages').append(html);

    messagesProcessed ++;
    if (messagesProcessed == messages.length) {
      scrollToBottom();
    }
  });
});

socket.on('newMessage', function (message) {
  var formatedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: formatedTime,
    url: message.url
  });

  jQuery('#messages').append(html);
  scrollToBottom();
});

// ***** UI Events ****

var locationButton = jQuery('#send-location');
var message_form = jQuery('#message-form');
var _window = jQuery(window);

message_form.on('submit', function(e) {
  e.preventDefault();
  var text = jQuery('[name=message]').val();
  socket.emit('createMessage', {
    room_id: localStorage.getItem('room_id'),
    user_name: localStorage.getItem('user_name'),
    text: text
  }, function () {
    jQuery('[name=message]').val('');
  });
});

locationButton.on('click', function(){
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');

  navigator.geolocation.getCurrentPosition( function(position) {
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      room_id: localStorage.getItem('room_id'),
      user_name: localStorage.getItem('user_name'),
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function(e) {
    locationButton.removeAttr('disabled').text('Send location');
    alert('Unable to fetch location: ' + e.message);
  });
});
