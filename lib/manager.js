'use strict';

var request = require('request');
var io = require('socket.io-client');
var globalConfig = require('./config');
var credentials;
var token = null;
var socket;

var apiUrl = globalConfig.apiUrl;
var chatServerUrl = globalConfig.chatServerUrl;

function BrandchatManager(config) {
   this.onNewQuestions = [];
   this.validationRules = [];
   this.onClosure = [];
   this.messageManager; 
   this.joinChatImmediatelly = true; //allow overwrite
   this.activateOn = (config.activateOn?config.activateOn:'activate-bot');
   this.deactivateOn = (config.deactivateOn?config.deactivateOn:'deactivate-bot');
   
   this.pausedBag = [];
   
   if (config.bot_key && config.secret_key) {
      console.log("Setting up Brandchat Manager Instance");
      this.bot_key = config.bot_key;
      this.secret_key = config.secret_key;
   }
   if (!(this instanceof BrandchatManager)) {
      return new BrandchatManager(config);
   }
}

BrandchatManager.prototype.isActive = function(questionId){
   var thisInstance = this;
   if(questionId){
      var pausedBotIndex = -1;
      var i;
      for(i = 0; i < thisInstance.pausedBag.length; i += 1) {
        if(thisInstance.pausedBag[i].id == questionId){
            pausedBotIndex = i;
            break;
        }
      }
      if(pausedBotIndex<0){//do nothing - already active
         return true;
      }
   }
   return false;  
};

BrandchatManager.prototype.setActive = function(questionId, isActive) {
   var thisInstance = this;
   if(questionId){
      if(isActive==true){//activate if not active
         var pausedBotIndex = -1;
         var i;
         for(i = 0; i < thisInstance.pausedBag.length; i += 1) {
           if(thisInstance.pausedBag[i].id == questionId){
               pausedBotIndex = i;
               break;
           }
         }  
         if(pausedBotIndex>=0){//unpause it by deleting element from pausedBag
            thisInstance.pausedBag.splice( pausedBotIndex, 1 ); 
            console.log("Bot is active");
         }//else, do nothing - already active
      }
      else{//pause this bot
         var pausedBotIndex = -1;
         var i;
         for(i = 0; i < thisInstance.pausedBag.length; i += 1) {
           if(thisInstance.pausedBag[i].id == questionId){
               pausedBotIndex = i;
               break;
           }
         }  
         if(pausedBotIndex>=0){//do nothing - already active
            
         }
         else{//pause it by adding it to the apausedBag array
            thisInstance.pausedBag.push( {id:questionId} ); 
            console.log("Bot is paused");
         }
      }  
   }
   //console.log("SetActive pausedBag debug:");
   //console.log(JSON.stringify(thisInstance.pausedBag));
};
BrandchatManager.prototype.onNewQuestion = function(callback) {
   var thisInstance = this;
   if(callback) {
      thisInstance.onNewQuestions.push(callback);
   }
};
BrandchatManager.prototype.validate = function(callback) {
   var thisInstance = this;
   if(callback) {
      thisInstance.validationRules.push(callback);
   }
};
BrandchatManager.prototype.onClose = function(callback) {
   var thisInstance = this;
   if(callback) {
      thisInstance.onClosure.push(callback);
   }
};

BrandchatManager.prototype.triggerClosure = function(question) {
   var thisInstance = this;
   if(question) {
      console.log("onClose event called");
      thisInstance.onClosure.forEach(function(item) {
         var tmp = item.call(thisInstance, question);
      });
   }
};
BrandchatManager.prototype.triggerValidation = function(question) {
   var thisInstance = this;
   var result = false;
   if(question) {
      result = true;
      thisInstance.validationRules.forEach(function(item) {
         var tmp = item.call(thisInstance, question);
         if(tmp==false){
            result = false;
         }
      });
   }
   if(result==false){
      console.log("Failed custom validation");
   }
   return result;
};

BrandchatManager.prototype.triggerOnNewQuestion = function(question) {
   var thisInstance = this;
   if(thisInstance.isActive(question.id)){
      if(question) {
         thisInstance.onNewQuestions.forEach(function(item) {
            item.call(thisInstance, question);
         });
      }   
   }
   else{
      console.log("Ignoring new question. Im inactive. You can change my status by setting active flag to true. e.g. brandchatManager.setActive(questionId, true)");
   }
   
};
BrandchatManager.prototype.joinChat = function(question) {
   var thisInstance = this;
   if(question) {
      thisInstance.messageManager.utils.post(apiUrl + '/users/helpQuestion/joinHelp', {id: question.id}, function(error, response, body){
         console.log(response.statusCode);
         if (response.statusCode==200) {
            console.log("Joining success. Info: ", body);
            thisInstance.messageManager.welcomeMessage.call(thisInstance, question);
         }
         else{
            console.log("ERROR joinHelp failed for user: " + thisInstance.bot_key + ".");
            console.log(error);
         }
      });  
      
   }
};
BrandchatManager.prototype.suggestClose = function(questionId) {
   var thisInstance = this;
   if(questionId) {
      setTimeout(function(){
         thisInstance.messageManager.utils.post(apiUrl + '/users/helpQuestion/suggestClosingChat', {id: questionId}, function(error, response, body){
            console.log(response.statusCode);
            if (response.statusCode==200) {
               console.log("Suggested closing success. Info: ", body);
               
            }
            else{
               console.log("ERROR Suggested closing failed for user: " + thisInstance.bot_key + ".");
               console.log(error);
            }
         }); 
      },2000);//slighly longer so user can see last message before suggest close
      
   }
};
BrandchatManager.prototype.forward = function(questionId, filterName) {
   var thisInstance = this;
   if(questionId && filterName) {
      setTimeout(function(){
         thisInstance.messageManager.utils.post(apiUrl + '/users/helpQuestion/forwardQuestion', {id: questionId, to:filterName}, function(error, response, body){
            console.log(response.statusCode);
            if (response.statusCode==200) {
               console.log("Forwarded success. Info: ", body);
            }
            else{
               console.log("ERROR forwarding failed for user: " + thisInstance.bot_key + " and filterName " + filterName + ".");
               console.log(error);
            }
         }); 
      },2000);
   }
   return null;
};
BrandchatManager.prototype.forceCloseChat = function(question) {
   var thisInstance = this;
   if(question) {
      thisInstance.messageManager.utils.post(apiUrl + '/users/helpQuestion/forceCloseChat', {id: question.id}, function(error, response, body){
         console.log(response.statusCode);
         if (response.statusCode==200) {
            console.log("Closing question success. Info: ", body);
         }
         else{
            console.log("ERROR closing chat failed for user: " + thisInstance.bot_key + ".");
            console.log(error);
         }
      });  
      
   }
};

BrandchatManager.prototype.connect = function(callback, messageManager) {
   var thisInstance = this;
   thisInstance.messageManager = messageManager;
   
   if (!thisInstance.bot_key || !thisInstance.secret_key) {
      console.log("Error, bot_key/secret_key missing");
      return;
   }
   
   //inject bot_key for PostedBy 
   console.log("chatServerUrl: " + chatServerUrl);
   messageManager.bot_key = thisInstance.bot_key;
   messageManager.apiUrl = apiUrl;
   messageManager.chatServerUrl = chatServerUrl;
   
   //establish socket conn
   socket = io.connect(chatServerUrl, {
      reconnect : true
   });
   
   if (socket) {//Successfully Conected to Chat Server
      
      //Registering global Event which fires when Chat Bot is authorized with Chat Server Successfully
      socket.on('connected', function(socket) {
         console.log('Hi there! Im bot and im connected.');
         if(callback) {
            callback(socket);
         }
      });
      
      //Register Listening Events - New Question and New Chat Message
      socket.on('messageReceived', function(name, message) {
         //console.log("messageReceived event received - ", JSON.stringify(message));
         switch (message.type) {
            case 'new-question':
               if(thisInstance.triggerValidation(message.item)){
                  thisInstance.triggerOnNewQuestion(message.item); 
                  
                  if(thisInstance.joinChatImmediatelly){
                    thisInstance.joinChat(message.item); 
                  }  
               }
               break;
            case 'closed-chat':
               if(message.item){
                  thisInstance.setActive(message.item.id, true);//this will effectivelly purge record from the pausedBag releasing memory
                  thisInstance.triggerClosure(message.item);
               }
               break;
            case 'forwarded-question':
               if(thisInstance.triggerValidation(message.item)){
                  thisInstance.triggerOnNewQuestion(message.item); 
                  
                  if(thisInstance.joinChatImmediatelly){
                    thisInstance.joinChat(message.item); 
                  }  
               }
               break;    
            case 'chatMessage':
               if(message.chatMsg && message.chatMsg.postedBy && message.chatMsg.postedBy!=thisInstance.bot_key){
                  if(thisInstance.isActive(message.chatMsg.questionId)){
                     if(message.chatMsg && message.chatMsg.messageText && message.chatMsg.messageText.toLowerCase()==thisInstance.deactivateOn){
                        thisInstance.setActive(message.chatMsg.questionId, false);
                        console.log("De-Activating code has been received via keyword '"+thisInstance.deactivateOn+"'. Disabling this bot and will stop listening all new messages");
                     }
                     else{
                        messageManager.triggerOnNewMessage(message.chatMsg);   
                     }
                  }
                  else{
                     if(message.chatMsg && message.chatMsg.messageText && message.chatMsg.messageText.toLowerCase()==thisInstance.activateOn){
                        thisInstance.setActive(message.chatMsg.questionId, true);
                        console.log("Activating code has been received via keyword '"+thisInstance.activateOn+"'. Reactivating this bot and will start listening new messages again");
                        messageManager.triggerOnNewMessage(message.chatMsg);
                     }
                     else{
                        console.log("Ignoring new message. Im inactive. You can change my status by setting active flag to true. e.g. brandchatManager.setActive(questionId, true)");
                     }
                  }
                  
               }
               break;        
         }
      });
      
      //Initiate Login and Authentication
      setTimeout(function() {
         thisInstance.login();
      }, 1000);
   }
};



BrandchatManager.prototype.login = function() {
   var thisInstance = this;
   if (thisInstance.bot_key && thisInstance.secret_key) {
      console.log("logging in...");
      request.post({
         url : apiUrl + '/login',
         qs : {username:thisInstance.bot_key, password:thisInstance.secret_key},
         json : {username:thisInstance.bot_key, password:thisInstance.secret_key}
      }, function(error, response, body) {
         //console.log(response?response.statusCode:'No response');
         if(response && response.statusCode==200) {
            //console.log("Login with Brandchat single-sign-on successful. Server says: ", body);
            //console.log("Authenticating with Chat Server in progress (it should take no longer then 10 seconds to get connected)");
            setTimeout(function(){
               thisInstance.authenticate(body);
            },3000);//to ensure tomcat token is propagated to redis before attemting atuhentication
         }
         else{
            console.log("ERROR login failed for user: " + thisInstance.bot_key + ". Please check bot_key/secret_key for this bot");
         }
      });
   }
   else{
      console.log("Missing bot_key or secret_key");
   }
};

BrandchatManager.prototype.authenticate = function(data) {
   var thisInstance = this;
   if(!data){
      console.log("Can't authenticate. No data received from login");
      return;
   }
   if (data.access_token) {
      token = data.access_token;
      thisInstance.messageManager.setToken(token);
      socket.emit('authentication', {
         token : data.access_token
      });
   }
};

module.exports = BrandchatManager;

 