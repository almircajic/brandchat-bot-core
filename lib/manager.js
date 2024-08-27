'use strict';

var axios = require('axios');
var io = require('socket.io-client');
var globalConfig = require('./config');

var apiUrl = globalConfig.apiUrl;
var chatServerUrl = globalConfig.chatServerUrl;

function BrandchatManager(config) {
   this.socket
   this.token = null
   this.onNewQuestions = [];
   this.validationRules = [];
   this.onDelivery = [];
   this.onClosure = [];
   this.messageManager; 
   this.joinChatImmediatelly = true; //allow overwrite
   this.activateOn = (config.activateOn?config.activateOn:'activate-bot');
   this.deactivateOn = (config.deactivateOn?config.deactivateOn:'deactivate-bot');
   this.chatServerUrl = config.chatServerUrl || chatServerUrl
   this.apiUrl = config.apiUrl || apiUrl
   
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
        console.log("activate if not active. activating")
         let pausedBotIndex = -1;
         let i;
         for(i = 0; i < thisInstance.pausedBag.length; i += 1) {
           //console.log("thisInstance.pausedBag[i].id",thisInstance.pausedBag[i],questionId)
           if(thisInstance.pausedBag[i].id == questionId){
               pausedBotIndex = i;
               break;
           }
         }  
         console.log("pausedBotIndex", pausedBotIndex)
         if(pausedBotIndex>=0){//unpause it by deleting element from pausedBag
            thisInstance.pausedBag.splice( pausedBotIndex, 1 ); 
            console.log("Bot is active");
         }//else, do nothing - already active
      }
      else{//pause this bot
         let pausedBotIndex = -1;
         let i;
         for(i = 0; i < thisInstance.pausedBag.length; i += 1) {
           if(thisInstance.pausedBag[i].id == questionId){
               pausedBotIndex = i;
               break;
           }
         }  
         if(pausedBotIndex>=0){//do nothing - already active
          console.log("pausing of the bot called and all is good. (bot was never in the active bag)")   
         }
         else{//pause it by adding it to the apausedBag array
            thisInstance.pausedBag.push( {id:questionId} ); 
            console.log("Bot is paused");
         }
      }  
   }
   //console.log("SetActive pausedBag debug:");
   console.log("PAUSEBAG:",thisInstance.pausedBag?thisInstance.pausedBag.length:0);
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
BrandchatManager.prototype.onDeliveryUpdate = function(callback) {
   var thisInstance = this;
   if(callback) {
      thisInstance.onDelivery.push(callback);
   }
};
BrandchatManager.prototype.triggerOnDelivery = function(question) {
   var thisInstance = this;
   if(question) {
      thisInstance.onDelivery.forEach(function(item) {
         item.call(thisInstance, question);
      });
   }
};

BrandchatManager.prototype.triggerClosure = function(question) {
   var thisInstance = this;
   if(question) {
      console.log("onClose event called");
      thisInstance.onClosure.forEach(function(item) {
         item.call(thisInstance, question);
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
         
         
         var questionCleaned = {
              id: question.id,
              postedDate: question.postedDate,
              messageText: question.messageText,
              text: question.messageText ? question.messageText.toLowerCase() : "",
              status: question.status,
              questionTag: question.questionTag,
              postedBy: question.postedBy,
              postedByInfoDisplayName: question.postedByInfoDisplayName,
              postedByInfoName: question.postedByInfoName,
              postedByInfoEmail: question.postedByInfoEmail,
              postedByInfoPhoto: question.postedByInfoPhoto,
              tagInfoBizHours: question.tagInfoBizHours,
              tagInfoColor: question.tagInfoColor,
              tagInfoTextcolor: question.tagInfoTextcolor,
              tagInfoCompanyName: question.tagInfoCompanyName,
              tagInfoBrandName: question.tagInfoBrandName,
              tagInfoLogo: question.tagInfoLogo,
              tagFilters: question.tagFilters,
              people: question.people,
              peopleInfo: question.peopleInfo,
              forwarded: question.forwarded?true:false,
              forwards: question.forwards,
              requestedClose: question.requestedClose,
              source: question.source,
              refId: question.refId,
              refType: question.refType,
              refObject: question.refObject,
              country: question.country,
              countryCode: question.countryCode,
              lon: question.lon,
              lat: question.lat,
              ar: question.ar,
              city: question.city,
              time_zone: question.time_zone,
              ip: question.ip,
              firstSlaMins:question.firstSlaMins,
              fromUrl: question.fromUrl,
              slaType: question.slaType
         };
         
         thisInstance.onNewQuestions.forEach(function(item) {
            item.call(thisInstance, questionCleaned);
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
      thisInstance.messageManager.utils.post(thisInstance.apiUrl + '/users/helpQuestion/joinHelp', {id: question.id}, function(error, response){
         console.log(response.statusCode);
         if (response.statusCode==200) {
            console.log("Joining success");
            thisInstance.messageManager.welcomeMessage.call(thisInstance, question);
         }
         else{
            console.log("ERROR joinHelp failed for user: " + thisInstance.bot_key + ".");
            console.log(error);
         }
      });  
      
   }
};
BrandchatManager.prototype.leave = function(questionId) {
   var thisInstance = this;
   if(questionId) {
      thisInstance.messageManager.utils.post(thisInstance.apiUrl + '/users/helpQuestion/leaveHelp', {id: questionId}, function(error, response){
         console.log(response.statusCode);
         if (response.statusCode==200) {
            console.log("Leaving help success and cleaning up the pauseBag");
            thisInstance.setActive(questionId, true);//this will effectivelly purge record from the pausedBag 
         }
         else{
            console.log("ERROR leaving failed for user: " + thisInstance.bot_key + ".");
            console.log(error);
         }
      });  
      
   }
};
BrandchatManager.prototype.suggestClose = function(questionId) {
   var thisInstance = this;
   if(questionId) {
      setTimeout(function(){
         thisInstance.messageManager.utils.post(thisInstance.apiUrl + '/users/helpQuestion/suggestClosingChat', {id: questionId}, function(error, response){
            console.log(response.statusCode);
            if (response.statusCode==200) {
               console.log("Suggested closing success.");
               
            }
            else{
               console.log("ERROR Suggested closing failed for user: " + thisInstance.bot_key + ".");
               console.log(error);
            }
         }); 
      },2000);//slighly longer so user can see last message before suggest close
      
   }
};
BrandchatManager.prototype.forward = function(questionId, filterName, callback) {
   var thisInstance = this;
   if(questionId && filterName) {
      setTimeout(function(){
         thisInstance.messageManager.utils.post(thisInstance.apiUrl + '/users/helpQuestion/forwardQuestion', {id: questionId, to:filterName}, function(error, response){
            console.log(response.statusCode);
            if (response.statusCode==200) {
               console.log("Forwarded success.");
               callback && callback(questionId, true);
               return
            }
            else{
               console.log("ERROR forwarding failed for user: " + thisInstance.bot_key + " and filterName " + filterName + ".");
               console.log(error);
               callback && callback(questionId, false);
               return
            }
         }); 
      },2000);
   }
   else{
    callback && callback(questionId, false);
    return null;
   }
   
};
BrandchatManager.prototype.forceCloseChat = function(question) {
   var thisInstance = this;
   if(question) {
      setTimeout(function(){
        thisInstance.messageManager.utils.post(thisInstance.apiUrl + '/users/helpQuestion/forceCloseChat', {id: question.id}, function(error, response){
           console.log((response ? response.statusCode : "response is null"));
           if (response && response.statusCode==200) {
              console.log("Closing question success.");
           }
           else{
              console.log("ERROR closing chat failed for user: " + thisInstance.bot_key + ".");
              console.log(error);
           }
        }); 
      },2000)
       
      
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
   console.log("chatServerUrl: " + thisInstance.chatServerUrl);
   messageManager.bot_key = thisInstance.bot_key;
   messageManager.apiUrl = thisInstance.apiUrl;
   messageManager.chatServerUrl = thisInstance.chatServerUrl;
   
   //establish socket conn
   this.socket = io.connect(thisInstance.chatServerUrl, {
      reconnect : true, transports:['websocket']
   });
   
   if (this.socket) {//Successfully Conected to Chat Server
      
      //Registering global Event which fires when Chat Bot is authorized with Chat Server Successfully
      this.socket.on('connected', function(socket) {
         console.log('Hi there! Im bot and im connected.');
         if(callback) {
            callback(socket);
         }
      });
      this.socket.on('disconnect', function() {// wait for reconnect
        console.log('socket-disconnected');
      }); 
      this.socket.on('reconnect', function() {// connection restored 
        console.log('socket-reconnected');
        if(this.token){
          console.log('sending token to socket for login');
          this.socket.emit('authentication', {
            token : this.token
          });
        }
        else{
          console.log("No token to authenticate. Doing new Login with bot credentials")
          setTimeout(function() {
            thisInstance.login();
          }, 1000);
        }
      } );  
      this.socket.on('reconnecting', function(nextRetry) {//trying to reconnect
        console.log('socket-retrying', nextRetry);
      } ); 
      this.socket.on('reconnect_failed', function() {
        console.log("Reconnect failed ");
      });
      
      //Register Listening Events - New Question and New Chat Message
      this.socket.on('messageReceived', function(name, message) {
         console.log("messageReceived event received - ", message.type);
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
                  thisInstance.setActive(message.item.id, false);//this will effectivelly purge record from the pausedBag releasing memory
                  thisInstance.triggerClosure(message.item);
               }
               break;
            case 'delivered':
               if(message.item){
                  thisInstance.triggerOnDelivery(message.item);
               }
               break;
            case 'delivery-failed':
               if(message.item){
                  thisInstance.triggerOnDelivery(message.item);
               }
               break;
            case 'delivery-retry':
               if(message.item){
                  thisInstance.triggerOnDelivery(message.item);
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
                     if(message.chatMsg && message.chatMsg.messageText &&  (message.chatMsg.messageText.toLowerCase()==thisInstance.activateOn || message.chatMsg.messageText.indexOf('#')==0) ){
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
      // request.post({
      //    url : thisInstance.apiUrl + '/login',
      //    qs : {username:thisInstance.bot_key, password:thisInstance.secret_key},
      //    json : {username:thisInstance.bot_key, password:thisInstance.secret_key}
      // }, function(error, response, body) {
      //    //console.log(response?response.statusCode:'No response');
      //    if(response && response.statusCode==200) {
      //       //console.log("Login with Brandchat single-sign-on successful");
      //       //console.log("Authenticating with Chat Server in progress (it should take no longer then 10 seconds to get connected)");
      //       setTimeout(function(){
      //          thisInstance.authenticate(body);
      //       },3000);//to ensure tomcat token is propagated to redis before attemting atuhentication
      //    }
      //    else{
      //       console.log("ERROR login failed for user: " + thisInstance.bot_key + ". Please check bot_key/secret_key for this bot");
      //    }
      // });
      axios.post(thisInstance.apiUrl + '/login', {
          username: thisInstance.bot_key,
          password: thisInstance.secret_key
      })
      .then(response => {
          if (response.status === 200) {
              setTimeout(function() {
                  thisInstance.authenticate(response.data);
              }, 3000); // to ensure tomcat token is propagated to redis before attempting authentication
          } else {
              console.log("ERROR login failed for user: " + thisInstance.bot_key + ". Please check bot_key/secret_key for this bot");
          }
      })
      .catch(error => {
          console.log("ERROR login failed for user: " + thisInstance.bot_key + ". Please check bot_key/secret_key for this bot", error);
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
      this.token = data.access_token;
      thisInstance.messageManager.setToken(this.token);
      this.socket.emit('authentication', {
         token : data.access_token
      });
   }
};

BrandchatManager.prototype.typing = function(questionId, username) {
  var thisInstance = this;
  if(this.socket){
    this.socket.emit('typing',{
      u : thisInstance.bot_key,
      qid : questionId,
      ppl: [username]
    });  
  }
};

module.exports = BrandchatManager;

 