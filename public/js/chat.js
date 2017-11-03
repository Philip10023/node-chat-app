var socket = io();

if ( $(window).width() > 739) {
  console.log('large screen')
}
else {
  socket.on('newMessage', function () {
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
  });
  //Add your javascript for small screens here
}

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



function scrollToBottom () {
  // Selectors
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child');
  // Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight)
  }
}

socket.on('connect', function () {
  var params = jQuery.deparam(window.location.search)

  socket.emit('join', params, function (err) {
    if (err) {
      alert(err)
      window.location.href = '/'
    } else {
      console.log('success')
    }
  })
});

socket.on('disconnect', function () {
  console.log('disconnected from server')
});

socket.on('updateUserList', function (users) {
  var ol = jQuery('<ol></ol>')
  users.forEach(function (user) {
    ol.append(jQuery('<li></li>').text(user))
  })

  jQuery('#users').html(ol)
})

socket.on('newMessage', function (message) {
  console.log(message.text)
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  jQuery('#messages').append(html);
  scrollToBottom()
});

socket.on('newLocationMessage', function (message) {
  var formattedTime = moment(message.createdAt).format('h:mm a')
  var template = jQuery('#location-message-template').html()
  var html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime
  })

  jQuery('#messages').append(html)
  scrollToBottom()
})

jQuery('#message-form').on('submit', function (e) {
  e.preventDefault();

  var messageTextBox = jQuery('[name=message]')

  socket.emit('createMessage', {
    text: messageTextBox.val()
  }, function () {
    messageTextBox.val('')
  });
});

var locationButton = jQuery('#send-location')
locationButton.on('click', function () {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser')
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...')

  navigator.geolocation.getCurrentPosition(function (position) {
    locationButton.removeAttr('disabled').text('Send location')
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    })
  }, function () {
    locationButton.removeAttr('disabled').text('send location')
    alert('unable to fetch location')
  })
})
