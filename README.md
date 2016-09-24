# brandchat-bot-core
Core wrapper library for building Brandchat Bots. Content of this document is still WORK IN PROGRESS. Visit us in a few days for final version.

## Installation

#### Requirements
In order to develop and run a Bots on your machine, you need few things setup before you begin: 
-	A valid Brandchat Account (see how to [sign up for Brandchat](https://www.brandchat.co/brands)).
-	Create a new Bot Agent (Under 'Agents' menu of your Brand Administration console) (TODO: See how to create new bot agent)
-	Download and Install NodeJS onto your target environment ([see how to install and setup NodeJS on your environment](https://nodejs.org/en/download/package-manager/))
-  Download and install Git from <https://git-scm.com/download> so you can clone this repository onto your machine. Alternativelly, you can download the source code from [Github](https://github.com/almircajic/brandchat-bot-core).

To add this library to your nodejs application (how to create new nodejs application is not part of this tutorial but `npm init` is a good start), use the following command:

`npm install https://github.com/almircajic/brandchat-bot-core.git --save`

This will add Brandchat Bot Core library to your app. Check out our starter template at <https://github.com/almircajic/brandchat-startup-bot.git>  

## Introduction
Brandchat Bots work by running as an independent micro apps that are listening and responding to the messages based on certain rules. They are, for all sense and purposes, brand representatives (or Brand Agents as we call them) like any other human representative, just that they run 24/7 and they have follow certain preset rules based on which conversation takes place.

In order to understand it better, we will start by explaining general flow of how Brandchat works. This will assist in understanding of commands and options available to you as a developer of Bots.  

#### Quick Overview of How Brandchat Works
There are three basic components of the flow in Brandchat. These are: 
- Asking Question 
- Chatting
- Closing Question

###### Asking Question
Person asks question from a particluar Brand by providing "Question Text" and then they select "Filter Category". Filter Categories are easy way to direct question to a particular department or a particular group of brand agents that are able to handle question of that nature. 

###### Chatting 
Once question is submitted, brand agents are informed about it and first agent who picks a question gets to chat with the person who asked the question. While chatting, agents can 1) "Forward Question" to another department or 2) "Suggest Closing" of the question.

###### Closing Question
Once question is answered, Agent can suggest closing of the question. Person who asked the question will be offered an easy way to close the question. Once question is closed, Brand agent and Person are "released" from their group chat.

#### Bots as Agents
Bots in Brandchat are actually brand agents, and their conversation is ruled by conditions built into the bot itself. In essence, Bot can "Answer New Question", "Respond" to person's inputs,  "Suggest closing" of the question or "Foward question" to "human" agent.


## Building a Bot
Now, with basic understanding of how Brandchat works and how Bots fit into the overal scheeme, lets build some Bots.

Assuming you have setup all requirements as per above, we are going to build a bot that will feature most of the existing features available to Bot developers. Lets call this new bot "Check Order Status" bot. 

### Bot: Check Order Status Use Case
This Bot will check status of the order based on OrderID by checking company's order management system. These are interaction flow steps:
- Ask customer to Enter Order Id
- Check status of the order based on Order ID by calling up external APIs
- If order status found, show Order Status 
- If order is not found, show message to the user that order is Not Found
- Offer user option to Chat with Human, or Close Question.

### Create a new NodeJS app
First, lets create a new app called Check Order Status. Open your command prompt (or Terminal) and type:

`mkdir check-order-status`

then, go into that folder:

`cd check-order-status`

then, type:

`npm init` to initialize node application. You will be asked several questions that will create `package.json` file describing your application.

Once `package.json` file is generated, type the following in your command prompt:

`npm install https://github.com/almircajic/brandchat-bot-core.git --save`

This will pull latest version of Brandchat Core Bot library into your app. When process is finished, you should see `node_modules` folder with `brandchat-bot-core` folder within it (a new version of Node will have many more folders under `node_modules` due to a new flat, rather then deep, folder structuring of modules)

### Initial (Basic) Bot Code
When core library is installed, create new index.js file on the root of your application folder `/check-order-status/index.js` using your favourite editor.

Now, add this code into index.js file.

```Javascript
var core = require("brandchat-bot-core");

//Initiate and connect to the Brandchat server
var messageManager = new core.MessageManager();
var brandchatManager = new core.BrandchatManager({bot_key:"your_bot_key", secret_key:"secret_key"});

brandchatManager.connect(function(loginInfo){}, messageManager);

//Welcome message from the Bot
messageManager.welcomeMessage = function(question){
   messageManager.sendMessageText(question.id, "Hi. I'm Check Order Status Bot");
};

//Bot correspondence flow
messageManager.onMessage(function(message){
   messageManager.sendMessageText(message.questionId, "Sorry, I can not handle your input, yet!");   
});
```

This code represents absolute minimum required code for bot to work. In essence, this bot will answer question by saying `Hi. I'm Check Order Status Bot` and will respond to any message with `Sorry, I can not handle your input, yet!`.

To try it out, just replace bot_key and security_key in the code above, and then run 
```
node index.js
```

If all was properly setup, you should be able to test the bot by asking question under Filter Category Bot is ready to handle (see Requirements above for how to setup Bot agents).

Let's move on and break it down and explain what we did here.


###### Include lib
```Javascript
var core = require("brandchat-bot-core");
```
This includes Brandchat Core Bot library and makes it available to you. This library is all you need to include for basic interaction with the Brandchat Bot. 


###### Configure
```Javascript
//Initiate and connect to the Brandchat server
var messageManager = new core.MessageManager();
var brandchatManager = new core.BrandchatManager({bot_key:"your_bot_key", secret_key:"secret_key"});
```
As comment suggests above, these two lines of code initiate two critical components of the library. First, `messageManage` will handle receiving and handling of messages, while `brandchatManager` will handle everything else. APIs of each are provided below (TODO: link to APIs below).

Change `your_bot_key` and `secret_key` with values provided while creating Bot agent (see Create a new Bot Agent under Requirements above).


###### Connect
```Javascript
brandchatManager.connect(function(loginInfo){
	// On successful login
}, messageManager);
```

This will initiate connection between your Bot app and Brandchat servers. If all is OK, you should see console messages similar to these:
```
Setting up Brandchat Manager Instance
chatServerUrl: https://chat.brandchat.co:443
logging in...
Hi there! Im bot and im connected.
```
If your credentials are incorrect, you will see `ERROR login failed for user: your_bot_key. Please check bot_key/secret_key for this bot`. Ensure that bot_key and secret_key are correct.


###### Interact
```Javascript
//Welcome message from the Bot
messageManager.welcomeMessage = function(question){
   messageManager.sendMessageText(question.id, "Hi. I'm Check Order Status Bot");
};
```
This code segment handles first contact between user and the bot. You register `messageManager.welcomeMessage` as a function with single parameter `question`. Question object is passed containing information about the question being asked. Details of Question object can be found below, under APIs (TODO: provide list of properties available to question).


```Javascript
//Bot correspondence flow
messageManager.onMessage(function(message){
   messageManager.sendMessageText(message.questionId, "Sorry, I can not handle your input, yet!"); 
});
```
And, finally,  this is the main "conversational flow" function that defines rules of engagement when it comes to messaging and responding to user inputs.

Each time user responds, this function is called and it contains Message object. Details of Message objects can be found below under APIs.

### Check Order Status Bot Code - Step by Step
Before we start going deep into more complex interactions, as of today, there are four rich message types available for interaction and we will use them all in this sample app. Details of each can be found under Rich Message Types below. They are:
1. Text Message: send message to the user
2. YesNo Message: asks user to click on one of two buttons
3. Input Message: asks user to enter valu in the text box
4. Options Message: offers user multiple options in a form of chips. 

Now, let's build a Bot that will check order status based on OrderID provided by the customer.

#### First Message - Get Order ID
When user asks a question, our first message will be to ask user to enter OrderId. So, lets build that. This code will create User Input message and let user enter their OrderId.
```Javascript
//Welcome message from the Bot
messageManager.welcomeMessage = function(question) {
   var userInput = {
      type : 'number',
      label : "Your Order ID",
      name : 'orderId',
      store : true,
      button : {
         label : 'Check',
         action : {
            reply : true,
            replyPrefix : 'Checking order number: '
         }
      }
   };

   messageManager.sendMessageInput(question.id, "Please enter your Order ID:", userInput);
};
```
If you replace existing `welcomeMessage` function with this one above, what you are essentially doing is telling Bot to ask user to enter their `Order ID` as soon as new question is received. This is considered Bot's first response. Notice that as `type` we put **number**. This instructs the user's keyboard to allow only numbers as Order ID.

To test this new code, restart your node app (or setup [**nodemon**](https://github.com/remy/nodemon) app that does this for you).

Then, go into Brandchat app and choose your brand, select filter category Bot is configured to handle and ask new question (enter any text as question text, since text of the question for this case is not relevant). 

If all is working right, your Bot should answer question with the message: **Please enter your Order ID:** and you can see input box expecting **Your Order ID**. Notice that button on the right is labeled **Check** as per our configuration of the `button` property of the `userInput` object. When order number is entered by the user, Bot will receive the input and respond with two messages: 1) **Checking order number: VALUE ENTERED**, and 2) **Sorry, I can not handle your input, yet!**.

First message is based on our `userInput` configuration that says reply as user with message "Chacking order number: " and append value that user enteredinto the input box. Second message is our usual response that basically says "I dont know how to handle user's input yet". This is true as our `onMessage` event does not do anything but always responds with same message. So, lets fix that.

To add some logic here, first we need to learn what kind of user inputs Brandchat Bot is capable of receiving. There are effectivelly three types:

1. **Simple reponses** : these are responses that have been provided when user types directly into default message text box or by clicking on YesNo message buttons for `sendMessageYesNo` message type. 
2. **Controlled typed reponses** : these are reponses that have been provided when Bot asks question using message type: `sendMessageInput`.
3. **Options responses** : these are reponses that have been provided when Bot asks question using message type: `sendMessageOptions`.

So, let's change `onMessage` slightly so that it can capture response from the user and run appropriate action.
```Javascript
messageManager.onMessage(function(message) {
   
   // all controlled user inputs are captured in message.userInput object
   // for now, all we need from this object is: name and value 
   if (message.userInput && message.userInput.value) {
      var userInput = message.userInput;
      // To store user's input, we can use local memory object, redis or any other database.
      // e.g.:  localInMemoryObject[message.questionId][userInput.name] = userInput.value;

      // Processing User Input. "userInput.name" must match userInput.name of the message object
      // specified above under userInput object in `welcomeMessage` function.
      if (userInput.name == 'orderId') {
         
         fakePostToAPIFunctionToCheckOrderByOrderId(userInput.value, 
            message, 
            function(msg, resultOfOrderSearch) {//onSuccess
               messageManager.sendMessageText(msg.questionId, 
               		"Your order status is: " + resultOfOrderSearch.status);
         });
         
      }
   } else {
      messageManager.sendMessageText(message.questionId, "Sorry, I don't understand you input");
   }
});
```
As you can see, for the first time, we are trying to grab what user has entered and react to it. In this case, expected user input 
is via controlled user input box (we asked for 'Order ID') and our Bot flow is basically doing this:
```
Pseudo code
-----------

If there is controlled user input then:
	check if name (of the variable) is 'orderId' and if it is, then: 
		call external API call by sending 'orderId' value and provide callback on successful response 
		callback function will then send message with the status of the order via 'sendMessageText' message
```

Here is the sample of the fake API call function:
```Javascript
//Fake function that returns status of the order based on order number
function fakePostToAPIFunctionToCheckOrderByOrderId(orderId, msg, onSuccess) {
   // Here you could make an API call to any external system, pass orderId value, 
   // and when results are returned, call onSuccess function passing 
   // back the original message object as well as result of an order API call
   if (orderId == '111') {
      onSuccess(msg, {status : 'Shipped'});
   } else {
      onSuccess(msg, {status : 'Not Found'});
   }
}
```
If you restart your node app and ask a new question, when Bot asks you to enter Order ID, you enter value as `111` and you should get message
saying *Your order status is: Shipped*. If you enter any other value but `111`, response should say *Your order status is: Not Found*. 

Basically, you get the gist of it. You are free to control the flow however you see fit. Fake API call function is just a sample and 
you can pass anything and everything to it as long as you have a callback method to inform user about your response.

#### Closing the Question
Each time user asks a question from the particular brand, this question (or chat) is kept under Active chats and is visible to the user
on their Home screen. If user has completed the task, in this case user has found out status of their order, it is only fair to close the question. 

In Brandchat, agent or Bot can not close the question. Question can only be closed by the user who posted the question to avoid agents closing 
questions that have not been answered to the user's satisfaction.

However, agent or a Bot can 'Suggest' closing of the question. If this option is called up, user will be notified and offered easy
way of closing the question. Once question is closed, it is removed from user's Home screen (as it's no longer active and relevant). 

To suggest closing of the question to the user, there is simple and convenient method under `brandchatManager` object. 
```Javascript
brandchatManager.suggestClose(message.questionId);
```
So, basically, to rework our onMessage flow, we could insert the above line of code just after we inform user about the status of the order. The 
complete function would now look like this:
```Javascript
messageManager.onMessage(function(message) {
   
   // all controlled user inputs are captured in message.userInput object
   // for now, all we need from this object is: name and value 
   if (message.userInput && message.userInput.value) {
      var userInput = message.userInput;
      // To store user's input, we can use local memory object, redis or any other database.
      // e.g.:  localInMemoryObject[message.questionId][userInput.name] = userInput.value;

      // Processing User Input. "userInput.name" must match userInput.name of the message object
      // specified above under userInput object in `welcomeMessage` function.
      if (userInput.name == 'orderId') {
         
         fakePostToAPIFunctionToCheckOrderByOrderId(userInput.value, 
            message, 
            function(msg, resultOfOrderSearch) {//onSuccess
               messageManager.sendMessageText(msg.questionId, 
               		"Your order status is: " + resultOfOrderSearch.status);

               //Adding code to suggest closing of the question
               brandchatManager.suggestClose(message.questionId);
         });
         
      }
   } else {
      messageManager.sendMessageText(message.questionId, "Sorry, I don't understand you input");
   }
});
```
With this extra line, we have successfully completed basic flow of checking order by orderId. Next section, we will handle what
happens if the user is not happy with the responses by the bot, how Bot can forward the question handling to actual human Agent.

#### Forwarding the Question
TODO:




## Brandchat Bot API

#### Rich Message Types
###### Text Message
```Javascript
messageManager.sendMessageText(message.questionId, "This is simple message");  
```
You can also send text message using default `sendMessage` method that resolves to `sendMessageText`.
```Javascript
messageManager.sendMessage(message.questionId, "This is also a simple message");  
```


###### YesNo Message
```Javascript
var action1 = {label:'Yes, I am', action:{reply:'customer'}};
var action2 = {label:'No', action:{reply:'not customer'}};

messageManager.sendMessageYesNo(message.questionId, "Are you an existing customer?", action1, action2);
```

###### User Input Message
```Javascript
var userInput = {type:'email', label:"Email", name:'email', store:true, button:{label:'Confirm', action:{reply:true, replyPrefix:'You entered email as: '}}};

messageManager.sendMessageInput(message.questionId, "Type your email", userInput);
```

###### Options Message
```Javascript
var option1 = {label:'Fridge', 	value:'Fridge',	action:{reply:'Checking Fridge deals and offers'}};
var option2 = {label:'TV', 		value:'TV',		action:{reply:'Checking TV deals and offers'}};
var option3 = {label:'Washer', 	value:'Washer',	action:{reply:'Checking Washer and Dryers deals and offers'}};
messageManager.sendMessageOptions(message.questionId, "Choose product you wish to see our latest offers for", 
	{store:true, name:'interestInDealsFor', options:[option1, option2, option3]});
```


#### Question Object
When question is asked, Question object is passed into `welcomeMessage` function. Question object contains the following information that you may find useful:

- String **messageText**: original value of the question user asked
- String **text**: adjusted - lowercase - value of the question user asked
- String **id**: Unique Id of the question
- Date **postedDate**: date message is posted
- String **status**: status of the question. By default this is always "Open" 
- String **questionTag**: unique string key for this brand (similar to #hashtag on social media networks - but we call it ?questiontag)
- String **postedBy**: username (phone number) of the person that posted the question 
- String **postedByInfoDisplayName**: display representation of the user who posted the question (it resolves to username if name is not provided)
- String **postedByInfoName**: name of the user who posted the question
- String **postedByInfoPhoto**: file name of the user who posted the question (TODO: Provide ways to get photo from our servers)
- String **tagInfoBizHours**: info about supporting hours
- String **tagInfoColor**: background color code of the brand
- String **tagInfoTextcolor**: text color of the brand
- String **tagInfoCompanyName**: full legal company name of the brand
- String **tagInfoBrandName**: brand name
- String **tagInfoLogo**: file name of the brand logo
- Array<String> **tagFilters**: list of tags user selected when asking the question. As of today, this list always returns one and only one item
- Array<String> **people**: list of usernames of people and bots who are attending to this question
- Array<JSON Objects> **peopleInfo**: list of JSON objects containing more details about people who are helping such as name and photo
- Boolean **forwarded**: is the message forwarded
- Date **requestedClose**: date of when agent has last time requested closing of this question.

Sample Question object:
```Javascript
{ 
     messageText: 'This is the Question USER asked',
     text: 'this is the question user asked',
     id: 'ff2cf9f7-b971-422a-c65a-b243a5964dc59999',
     postedDate: '2016-09-21T10:25:37Z',
     status: 'Open',
     questionTag: 'unique-tag-associated-with-the-brand',
     postedBy: 'username-phonenumber-of-user-who-posted-the-question',
     postedByInfoDisplayName: 'Almir C.',
     postedByInfoName: 'Almir C.',
     postedByInfoPhoto: 'filename-of-photo.png',
     tagInfoBizHours: 'Weekdays 9am-6pm',
     tagInfoColor: '#303f9f',
     tagInfoCompanyName: 'Alcassoft Solutions Sdn.Bhd.',
     tagInfoBrandName: 'Brandchat',
     tagInfoLogo: 'filename-of-logo.png',
     tagFilters: [ 'Selected tag' ],
     people: [ 'bot-key or username of agent' ],
     peopleInfo: [ Array of JSON objects of people ],
     tagInfoTextcolor: '#ffffff',
     forwarded: false,
     requestedClose: null
} 
```

#### Message Object
Message object contains the following properties:

- String **messageText**: original value of the text (reply) user entered in the chat box
- String **text**: adjusted - lowercase - value of the text (reply) user entered in the chat box
- String **questionId**: Unique Id of the question. 
- String **id**: Unique Id of the chat message
- JSON Object **userInput**: object containing reponse provided by user when offered Rich Message Input input (TODO: link to more details about Input Rich Message)
- JSON Object **buttonInput**: object containing response provided by user when offered Rich Message Buttons input (TODO: link to more details about Buttons Rich Message)
- String **postedBy**: username (phone number) of the person that posted the question (it could be person who asked the question, any of the agents that join the conversation or other bots as bot_key of the bot)
- Date **postedDate**: date message is posted

Sample message object:
```Javascript
{  
       messageText: 'This is MESSAGE text',
       text: 'this is message text',
       questionId: 'cd2cf7f7-b971-422a-c65a-gq988af6a4qw9999',
	   id: '8b629bc6-e2f9-49ae-8297-f29aaaf6aafa9999',
       userInput: JSON Object,
       buttonInput: JSON Object,
       postedBy: 'username-of-person-or-bot-that-posted-this-message'
	   postedDate: '2016-09-21T10:25:37Z'
}
```

## Support:
- Any bugs regarding Brandchat Core library please report it <https://github.com/almircajic/brandchat-bot-core/issues>

## Release History

* 1.0.0 Initial release
