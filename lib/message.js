var request = require('request');
var BrandchatUtils = require('./utils');
var token;

function MessageManager(config) {
   this.welcomeMessage;
   this.bot_key;
   this.token;
   this.utils = new BrandchatUtils();
   this.apiUrl;
   this.chatServerUrl;
   
   this.onMessages = [];
   
   if (!(this instanceof MessageManager)) {
      return new MessageManager(config);
   }
}

MessageManager.prototype.onMessage = function(callback) {
   var thisInstance = this;
   if(callback) {
      thisInstance.onMessages.push(callback);
   }
};
MessageManager.prototype.triggerOnNewMessage = function(message) {
   var thisInstance = this;
   if(message) {
      //console.log("triggerOnNewMessage", thisInstance.onMessages.length);
      thisInstance.onMessages.forEach(function(item) {
         //console.log("triggerOnNewMessage item by item");
         item.call(thisInstance, {
            text:message.messageText.toLowerCase(),
            questionId: message.questionId,
            id: message.id,
            userInput: message.userInput,
            buttonInput: message.buttonInput
         });
      });
   }
};
MessageManager.prototype.coreMessage = function(questionId){
   var thisInstance = this;
   return {
      id : thisInstance.utils.createUuid(),
      guid : thisInstance.utils.createUuid(),
      questionId : questionId,
      postedDate : Date.now(),
      postedBy : thisInstance.bot_key
   };
};

MessageManager.prototype.setToken = function(token) {
   this.token = token;
   this.utils.setToken(token);
};

MessageManager.prototype.sendMessageInput = function(questionId, text, input) {
   var thisInstance = this;
   if(!thisInstance.token){
      console.log("Token missing");
   }
   if (questionId && text) {
      console.log("sendMessage: " + text);

      var msg = thisInstance.coreMessage(questionId);
      msg.messageText = text;
      msg.userInput = input;//{label:"Brand name", name:'brandName', button:{label:'Next', action:{reply:true, replyPrefix:'Brand name: '}}}
      
      setTimeout(function(){
         thisInstance.utils.post(thisInstance.apiUrl + '/users/chatMsg/sendMessage', msg, function(error, response, body) {
            console.log(response.statusCode);
            if (response.statusCode == 200) {
               console.log("Message sent success");
            } else {
               console.log("ERROR sending a message");
            }
         });
     },1000);
      
   }
};
MessageManager.prototype.sendMessageYesNo = function(questionId, text, action1, action2) {
   var thisInstance = this;
   if(!thisInstance.token){
      console.log("Token missing");
   }
   if (questionId && text) {
      console.log("sendMessage: " + text);

      var msg = thisInstance.coreMessage(questionId);
      msg.messageText = text;
      msg.action1 = action1;
      msg.action2 = action2;
      
      setTimeout(function(){
         thisInstance.utils.post(thisInstance.apiUrl + '/users/chatMsg/sendMessage', msg, function(error, response, body) {
            console.log(response.statusCode);
            if (response.statusCode == 200) {
               console.log("Message sent success.");
            } else {
               console.log("ERROR sending a message");
            }
         });
      },1000);
    
   }
};

MessageManager.prototype.sendMessageButtons = function(questionId, text, actionButtons) {
   var thisInstance = this;
   if(!thisInstance.token){
      console.log("Token missing");
   }
   if (questionId && text) {
      console.log("sendMessage: " + text, actionButtons);
      
      //actionButtons.name is REQUIRED FIELD
      
      var msg = thisInstance.coreMessage(questionId);
      msg.messageText = text;
      msg.actions = actionButtons;
      
      setTimeout(function(){
         thisInstance.utils.post(thisInstance.apiUrl + '/users/chatMsg/sendMessage', msg, function(error, response, body) {
            console.log(response.statusCode);
            if (response.statusCode == 200) {
               console.log("Message sent success.");
            } else {
               console.log("ERROR sending a message");
            }
         });
     },1000);
    
   }
};


MessageManager.prototype.sendMessage = function(questionId, text) {
   var thisInstance = this;
   if(!thisInstance.token){
      console.log("Token missing");
   }
   if (questionId && text) {
      console.log("sendMessage: " + text);
      
      var msg = thisInstance.coreMessage(questionId);
      msg.messageText = text;
      
     setTimeout(function(){
         thisInstance.utils.post(thisInstance.apiUrl + '/users/chatMsg/sendMessage', msg, function(error, response, body) {
            console.log(response.statusCode);
            if (response.statusCode == 200) {
               console.log("Message sent success");
            } else {
               console.log("ERROR sending a message");
            }
         });
     },1000);
   }
};
module.exports = MessageManager;

