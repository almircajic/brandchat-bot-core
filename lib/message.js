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
      thisInstance.onMessages.forEach(function(item) {
         item.call(thisInstance, {
            text: message.messageText.toLowerCase(),
            messageText: message.messageText,
            questionId: message.questionId,
            questionTag: message.questionTag,
            id: message.id,
            userInput: message.userInput,
            buttonInput: message.buttonInput,
            postedBy: message.postedBy,
            postedDate: message.postedDate,
            file: message.file,
            attachments: message.attachments,
            refObject: message.refObject
         }, message.userInput, message.buttonInput);
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

MessageManager.prototype.postMessageToServer = function(msg, onSuccess, onError){
   var thisInstance = this;
   if(!thisInstance.token){
      console.log("Token missing");
      onError && onError({msg: msg, code:'MissingToken'});
   }
   else{
      if(msg){
         console.log("Sending message: " + msg.messageText);
         //setTimeout(function(){
            thisInstance.utils.post(thisInstance.apiUrl + '/users/chatMsg/sendMessage', msg, function(error, response, body) {
               console.log(response.statusCode);
               if (response.statusCode == 200) {
                  console.log("Message sent success");
                  onSuccess && onSuccess({msg: msg, code:'OK'});
               } else {
                  console.log("Error while submitting message to the server");
                  onError && onError({msg: msg, code:'MissingToken', message:'Error while submitting message to the server', error:error});
               }
            });
        //},0); 
      }
      else{
         console.log("Missing MSG object. Message not submitted");
         onError && onError({msg: msg, code:'MissingObject', message:'Error while submitting message to the server'});
      }
   }
};

MessageManager.prototype.sendMessageInput = function(questionId, text, input, onSuccess, onError) {
   var thisInstance = this;
   
   if (questionId && text && input) {
      
      var msg = thisInstance.coreMessage(questionId);
      msg.messageText = text;
      msg.userInput = input;
      
      thisInstance.postMessageToServer(msg, onSuccess, onError);
   }
   else{
      console.log("Missing questionId or text or userInput object");
      onError && onError({msg: {questionId: questionId}, code:'MissingRequiredParams', message:'Missing questionId or text or userInput object'});
   }
};
MessageManager.prototype.sendMessageYesNo = function(questionId, text, action1, action2, onSuccess, onError) {
   var thisInstance = this;
   
   if (questionId && text && action1 && action2) {
      
      var msg = thisInstance.coreMessage(questionId);
      msg.messageText = text;
      msg.action1 = action1;
      msg.action2 = action2;
      
      thisInstance.postMessageToServer(msg, onSuccess, onError);   
   }
   else{
      console.log("Missing questionId or text or action1 or action2 objects");
      onError && onError({msg: {questionId: questionId}, code:'MissingRequiredParams', message:'Missing questionId or text or action1 or action2 objects'});
   }
};

MessageManager.prototype.sendMessageOptions = function(questionId, text, options, onSuccess, onError) {
   var thisInstance = this;
   
   if (questionId && text && options) {
      
      var msg = thisInstance.coreMessage(questionId);
      msg.messageText = text;
      msg.actions = options;  //for some reason we need both
      msg.options = options;  //for some reason we need both
      
      thisInstance.postMessageToServer(msg, onSuccess, onError);    
   }
   else{
      console.log("Missing questionId or text or actionButtons objects");
      onError && onError({msg: {questionId: questionId}, code:'MissingRequiredParams', message:'Missing questionId or text or actionButtons objects'});
   }
};


MessageManager.prototype.sendMessageImage = function(questionId, text, imageUrl, onSuccess, onError) {
   var thisInstance = this;
   
   if (questionId && text && imageUrl) {
      
      var msg = thisInstance.coreMessage(questionId);
      msg.messageText = text;
      msg.file = imageUrl; 
      thisInstance.postMessageToServer(msg, onSuccess, onError);    
   }
   else{
      console.log("Missing questionId or text or image objects");
      onError && onError({msg: {questionId: questionId}, code:'MissingRequiredParams', message:'Missing questionId or text or imageUrl objects'});
   }
};
MessageManager.prototype.sendMessageText = function(questionId, text, onSuccess, onError) {
   var thisInstance = this;
   if (questionId && text) {
      
      var msg = thisInstance.coreMessage(questionId);
      msg.messageText = text;
      
      thisInstance.postMessageToServer(msg, onSuccess, onError);
   }
   else{
      console.log("Missing questionId or text");
      onError && onError({msg: {questionId: questionId}, code:'MissingRequiredParams', message:'Missing questionId or text'});
   }
};

//Default method resolving to sendMessageText call
MessageManager.prototype.sendMessage = function(questionId, text, onSuccess, onError) {
   var thisInstance = this;
   thisInstance.sendMessageText(questionId, text, onSuccess, onError);
};

module.exports = MessageManager;

