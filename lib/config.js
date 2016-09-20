
'use strict';

var apiUrl = 'https://api.brandchat.co/asknya-server/api';
var chatServerUrl = 'https://chat.brandchat.co:443';

if (process.env.NODE_ENV === 'production') {
} else {
   //apiUrl = 'http://moonster:8080/asknya-server/api';
   //chatServerUrl = 'http://moonster:3001/';
}

module.exports.apiUrl = apiUrl; 
module.exports.chatServerUrl = chatServerUrl; 
