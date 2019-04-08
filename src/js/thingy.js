(function(w, d) {
  var messages = [
    {
      title: 'Contractual Obligations', 
      url: ''
    },
    {
      title: 'The World of qwerty Osman', 
      url: ''
    },
    {
      title: 'Hackfield and The North', 
      url: ''
    },
    {
      title: 'Osmana Grande', 
      url: ''
    },
    {
      title: 'Lirik Nekronomikus Kahnt', 
      url: ''
    },
    {
      title: 'Facelift Renewal Program', 
      url: ''
    },
    {
      title: '@daslaf', 
      url: ''
    },
    {
      title: 'Having avocado toasts since 1989', 
      url: ''
    },
    {
      title: 'The return of the son of shut up and put CSS in JS', 
      url: ''
    },
    {
      title: 'It must be OCaml', 
      url: ''
    },
    {
      title: 'You get... you get nothing with your college degree', 
      url: 'https://youtu.be/FmX3MGX9RYU?t=260'
    },
    {
      title: 'These giraffees eat leaves, and they run also very fast', 
      url: ''
    },
  ];

  var footer = d.getElementById('footer');

  var handler = setInterval(drawMessage(messages, footer), 7000);
})(window, document);

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawMessage(messages, where) {
  var prefix = 'Welcome to: ';

  return function() {
    // var msg = choose random message;
  }
}