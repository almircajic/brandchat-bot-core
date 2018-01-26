# brandchat-bot-core
This is the core wrapper library for building Brandchat Bots.  The content of this document is still a WORK IN PROGRESS. Visit us in a few days for the final version.

## Installation

#### Requirements
###### Development Environment  
To setup your development environment, you will need to:
-  Download and Install NodeJS onto your target environment ([see how to install and setup NodeJS on your environment](https://nodejs.org/en/download/package-manager/))
-  Download and install Git from <https://git-scm.com/download> so you can clone this repository onto your machine. Alternatively, you can download the source code from [Github](https://github.com/almircajic/brandchat-bot-core).

#### Adding NPM Brandchat Dependencies
To add this library to your nodejs application (how to create new nodejs application is not part of this tutorial but `npm init` is a good start), use the following command:

`npm install https://github.com/almircajic/brandchat-bot-core.git --save`

This will add the Brandchat Bot Core library to your app. Check out our starter template at <https://github.com/almircajic/brandchat-startup-bot.git>  


###### Creating Test Bots Agents
To create and test Bots in a test environment, you will need to download the Brandchat app and register using your valid mobile phone number. Here is the full list of what is needed:

- Download the Brandchat app from the Google Play or App Store.
- Follow the registation process after starting teh Brandchat app for the first time.
- Then, open this url in Chrome browser or Safari on Mac (Edge & Firefox are not supported yet for Bot testing on the web): <https://testbot.brandchat.co>
- The system will ask you to enter your phone number. This must be the same number you used to register your Brandchat app with (under Development Environment above).
- If the number matches your registration number and you have already downloaded and registered the app on your phone, you should receive a push notification on your phone with a temporary password that will let you login to the TestBot system. Note that the password epires within 5 minutes.
- Once you are logged into the testbot.brandchat.co web portal, click on the Top Right Icon to view the Bot Startup Screen. Here you can create your new Bot Credentials (New Bot button on top). 
- Creating Bot Credentials returns `bot_key` and `secret_key`. Note that the `secret_key` WILL ONLY BE SHOWN ONCE. You will not be able to retrieve this key after this step, so please keep it safe. However, if you lose it, you can always create new Bot Credentials following the steps above.
- The Bot Startup Screen will have a `Start` button. Starting the Bot will eventually trigger a "New Question" to that bot, so have your Bot ready and active (starting Bot is explained below in detail).

###### Pushing Bots to Live Brandchat 
Once you have created the Bot on your test environment, you will need to propagate it into the Live Brandchat environment. To do that, you will need the following:
-	A valid Brandchat Brand Account (see how to [sign up for Brandchat](https://www.brandchat.co/brands) ).
-	Create a new Bot Agent (Under 'Agents' menu of your Brand Administration console) (TODO: See how to create a new bot agent). You will receive a `bot_key` and `secret_key` for your new Live bot.
- Update these credentials in your code and start the Bot to have it Live and serving new questions immediatelly.
-  How to run the Bot for a Live environment is explained below in detail. 



## Introduction
Brandchat Bots work by running as independent micro apps that are listening and responding to messages based on certain rules. They are, for all intents and purposes, brand representatives (or Brand Agents, as we call them) like any other human representative, just that they run 24/7 and they  follow the rules of conversation as per the conditions set in the Bot code itself.

In order to understand it better, we will start by explaining the general flow of how the Brandchat system works. This will assist in the understanding of commands and options available to you as a Brandchat Bot developer.  

#### A Quick Overview of How Brandchat Works
There are three basic components of the flow in Brandchat. These are: 
- Asking a Question 
- Chat exchange (conversation)
- Closing the Question

###### Asking a Question
A person asks a question of a particluar Brand by providing a "Question Text". They then select a "Filter Category". Filter Categories are an easy way to direct questions to a particular department or a particular group of brand agents that are able to handle questions of that nature. 

###### Chatting 
Once a question is submitted, brand agents are informed, and the first agent who picks up the question gets to chat with the person who asked the question. While chatting, agents can 1) "Forward Question" to another department or 2) "Suggest Closing" of the question.

###### Closing the Question
Once the question is answered, the Agent can suggest to close the question. The person who asked the question will be offered an easy way to close the question. Once the question is closed, the Brand Agent and Asker are "released" from their chat conversation.

#### Bots as Agents
Bots in Brandchat are actually brand agents, and their conversation is ruled by conditions built into the bot itself. In essence, the Bot can "Answer a New Question", "Respond" to a person's input,  "Suggest closing" of a question or "Foward question" to a "human" agent.


## Building a Bot
Now that we have a basic understanding of how Brandchat works, and how Bots fit into the overall scheme, let us build some Bots.

Assuming you have setup all the requirements as listed above, we are going to build a bot that will feature most of the existing features available to Bot developers. Lets call this new bot "Check Order Status" bot. 

### Bot: Check Order Status Use Case
This Bot will check the status of the order based on the OrderID, by checking the company's order management system. These are the interaction flow steps:
- Ask customer to Enter Order Id
- Check status of the order based on Order ID by calling up external APIs
- If order status is found, show Order Status 
- If order is not found, show message to the user that the order is Not Found
- Offer the user the option to Chat with a Human, or Close the Question.

### Create a new NodeJS app
First, lets create a new app called Check Order Status. Open your command prompt (or Terminal) and type:

`mkdir check-order-status`

then, go into that folder:

`cd check-order-status`

then, type:

`npm init` to initialize node application. You will be asked several questions that will create a `package.json` file describing your application.

Once the `package.json` file is generated, type the following into your command prompt:

`npm install https://github.com/almircajic/brandchat-bot-core.git --save`

This will pull the latest version of the Brandchat Core Bot library into your app . When the process is finished, you should see a `node_modules` folder with a `brandchat-bot-core` folder within it (a new version of Node will have many more folders under `node_modules` due to a new flat, rather than deep, folder structuring of modules)

### Initial (Basic) Bot Code
When the core library is installed, create a new index.js file on the root of your application folder `/check-order-status/index.js` using your desired editor.

Now, add this code into the index.js file.

```Javascript
var core = require("brandchat-bot-core");

//Initiate and connect to the Brandchat server
var messageManager = new core.MessageManager();
var brandchatManager = new core.BrandchatManager({bot_key:"your_bot_key", secret_key:"secret_key"});

brandchatManager.connect(function(loginInfo){}, messageManager);

//Welcome message from the Bot
messageManager.welcomeMessage = function(question){
   messageManager.sendMessageText(question.id, "Hi. I'm the Check Order Status Bot");
};

//Bot correspondence flow
messageManager.onMessage(function(message, userInput, optionsInput){
   messageManager.sendMessageText(message.questionId, "Sorry, I cannot handle your input, yet!");   
});
```

This code represents the absolute minimum required code for the bot to work. In essence, this bot will answer questions by saying `Hi. I'm the Check Order Status Bot` and will respond to any message with `Sorry, I cannot handle your input, yet!`.

To try it out, just replace bot_key and security_key in the code above, and then run 
```
node index.js
```

If all was properly setup, you should be able to test the bot by asking a question under the Filter Category that the Bot is ready to handle (see Requirements above for how to setup Bot agents).

Let's move on, break it down, and explain what we did here.


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
As the comment above suggests, these two lines of code initiate two critical components of the library. First, `messageManage` will handle receiving and handling of messages, while `brandchatManager` will handle everything else. APIs of each are provided below (TODO: link to APIs below).

Change `your_bot_key` and `secret_key` with the values provided while creating the Bot agent (see Create a new Bot Agent under Requirements above).


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
This code segment handles the first contact between the user and the bot. You register `messageManager.welcomeMessage` as a function with a single parameter `question`. The Question object is sent containing information about the question being asked. Details of the Question object can be found below, under APIs (TODO: provide list of properties available to question).


```Javascript
//Bot correspondence flow
messageManager.onMessage(function(message, userInput, optionsInput){
   messageManager.sendMessageText(message.questionId, "Sorry, I can not handle your input, yet!"); 
});
```
And, finally,  this is the main "conversational flow" function that defines the rules of engagement when it comes to messaging and responding to user inputs.

Each time a user responds, this function is called, and it contains the Message object. Details of the Message objects can be found below under APIs.

### Check Order Status Bot Code - Step by Step
Before we start going deep into more complex interactions, as of today, there are four rich message types available for interaction and we will use them all in this sample app. Details of each can be found under Rich Message Types below. They are:
1. Text Message: send message to the user
2. YesNo Message: asks user to click on one of two buttons
3. Input Message: asks user to enter value in the text box
4. Options Message: offers user multiple options in the form of chips. 

Now, let's build a Bot that will on check order status based on OrderID provided by the customer.

#### First Message - Get Order ID
When a user asks a question, our first message will be to ask the user to enter their OrderId. So, let's build that. This code will create a User Input message and lets the user enter their OrderId.
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
If you replace the existing `welcomeMessage` function with this one above, what you are essentially doing is telling the Bot to ask the user to enter their `Order ID` as soon as the new question is received. This is considered the Bot's first response. Notice that as `type` we put **number**. This instructs the user's keyboard to allow only numbers as Order ID.

To test this new code, restart your node app (or setup [**nodemon**](https://github.com/remy/nodemon) app that does this for you).

Then, go into the Brandchat app and choose your brand, select the filter category that the Bot is configured to handle, and ask a new question (enter any text as question text, since the actual text is not relevant in this case). 

If all is working right, your Bot should answer the question with the message: **Please enter your Order ID:** and you can see the input box expecting **Your Order ID**. Notice the button on the right is labeled **Check** as per our configuration of the `button` property of the `userInput` object. When the order number is entered by the user, the Bot will receive the input and respond with two messages: 1) **Checking order number: VALUE ENTERED**, and 2) **Sorry, I can not handle your input, yet!**.

The first message is based on our `userInput` configuration that says, reply as user with message "Checking order number: " and append value that user entered into the input box. The second message is our usual response that basically says "I don't know how to handle user's input yet". This is true as our `onMessage` event does not do anything but always responds with the same message. So, lets fix that.

To add some logic here, first we need to learn what kind of user inputs the Brandchat Bot is capable of receiving. There are effectively three types:

1. **Simple reponses** : these are responses that have been provided when a user types directly into the default message text box or by clicking on YesNo message buttons for `sendMessageYesNo` message type. 
2. **Controlled typed reponses** : these are reponses that have been provided when the Bot asks a question using the message type: `sendMessageInput`.
3. **Options responses** : these are reponses that have been provided when the Bot asks a question using message type: `sendMessageOptions`.

So, let's change `onMessage` slightly so that it can capture response from the user and run the appropriate action.
```Javascript
messageManager.onMessage(function(message, userInput, optionsInput) {
   
   // rich message user inputs are captured as userInput object and passed here
  
   // SIDE NOTE: To store user's input, we can use local memory object, redis or any other database.
   //            e.g.:  localInMemoryObject[message.questionId][userInput.name] = userInput.value;

   // Processing User Input by comparing that "userInput.name" matches Rich Message object name
   if (userInput && userInput.name == 'orderId') {
      
      fakePostToAPIFunctionToCheckOrderByOrderId(userInput.value, 
         message, 
         function(msg, resultOfOrderSearch) {//onSuccess
            messageManager.sendMessageText(msg.questionId, 
            		"Your order status is: " + resultOfOrderSearch.status);
      });
      
   
   } else {
      messageManager.sendMessageText(message.questionId, "Sorry, I don't understand you input");
   }
});
```
As you can see, for the first time, we are trying to grab what the user has entered, and react to it. In this case, the expected user input 
is via a controlled user input box (we asked for 'Order ID') and our Bot flow is basically doing this:
```
Pseudo code
-----------

If there is controlled user input, then:
	check if the name (of the variable) is 'orderId' If it is, then: 
		call external API call by sending the 'orderId' value, and provide callback on successful response 
		the callback function will then send a message with the status of the order via 'sendMessageText' message
```

Here is a sample of the fake API call function:
```Javascript
//Fake function that returns status of the order based on order number
function fakePostToAPIFunctionToCheckOrderByOrderId(orderId, msg, onSuccess) {
   // Here you could make an API call to any external system, pass orderId value, 
   // and when results are returned, call onSuccess function passing 
   // back the original message object as well as result of the order API call
   if (orderId == '111') {
      onSuccess(msg, {status : 'Shipped'});
   } else {
      onSuccess(msg, {status : 'Not Found'});
   }
}
```
If you restart your node app and ask a new question, when the Bot asks you to enter Order ID, you enter the value as `111`. You should get a message
saying *Your order status is: Shipped*. If you enter value other than `111`, the response should say *Your order status is: Not Found*. 

Basically, you get the gist of it. You are free to control the flow however you see fit. The fake API call function is just a sample and 
you can pass anything and everything to it as long as you have a callback method to inform the user about your response.

#### Closing the Question
Each time a user asks a question of a particular brand, this question (or chat) is kept under Active chats and is visible to the user
on their Home screen. If the user has completed the task, i.e. in this case, found the status of their order, it is only fair to close the question. 

In Brandchat, the agent or Bot cannot close a question. The question can only be closed by the user who posted the question. This is to avoid agents closing questions prematurely, or not to the user's satisfaction.

However, the agent or a Bot can 'Suggest' closing the question. If this option is called up, the user will be notified and offered an easy
way of closing the question. Once a question is closed, it is removed from the user's Home screen (as it's no longer active or relevant). 

To suggest closing of the question to the user, there is a simple and convenient method under `brandchatManager` object. 
```Javascript
brandchatManager.suggestClose(message.questionId);
```
So, to rework our onMessage flow, we could insert the above line of code just after we inform the user of the status of their order. The 
complete function would now look like this:
```Javascript
messageManager.onMessage(function(message, userInput, optionsInput) {
   
   // rich message user inputs are captured as userInput object and passed here
  
   // SIDE NOTE: To store user's input, we can use local memory object, redis or any other database.
   //            e.g.:  localInMemoryObject[message.questionId][userInput.name] = userInput.value;

   // Processing User Input by comparing that "userInput.name" matches Rich Message object name
   if (userInput && userInput.name == 'orderId') {
         
      fakePostToAPIFunctionToCheckOrderByOrderId(userInput.value, 
         message, 
         function(msg, resultOfOrderSearch) {//onSuccess
            messageManager.sendMessageText(msg.questionId, 
            		"Your order status is: " + resultOfOrderSearch.status);

            //Adding code to suggest closing of the question
            brandchatManager.suggestClose(message.questionId);
      });

   } else {
      messageManager.sendMessageText(message.questionId, "Sorry, I don't understand your input");
   }
});
```
With this extra line, we have successfully completed the basic flow of checking order by orderId. In the next section, we will handle what
happens if the user is not happy with the responses by the bot, i.e. how the Bot can forward the question to an actual human Agent to handle.

#### Forwarding the Question
TODO:




## Brandchat Bot API

#### Rich Message Types
###### Text Message
```Javascript
messageManager.sendMessageText(message.questionId, "This is a simple message");  
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
messageManager.sendMessageOptions(message.questionId, "Choose the product you wish to see our latest offers for", 
	{store:true, name:'interestInDealsFor', options:[option1, option2, option3]});
```


#### Question Object
When a question is asked, the Question object is passed into the `welcomeMessage` function. The Question object contains the following information that you may find useful:

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
- Array<JSON Object> **peopleInfo**: list of JSON objects containing more details about people who are helping such as name and photo
- Boolean **forwarded**: is the message forwarded
- Array<JSON Object> **forwards**: list of forwards for this question with information who forwarded, when and from which channel.
- Date **requestedClose**: date when the agent had last requested to close the question.
- String **source**: where the question came from, from website (Brandchat live chat plugin), FB Messenger, Brandchat App, Email, or other sources
- String **refId**: reference ID contains ID of Brandchat Brandcast object that triggered the question as well as FB Ad Canvas ID if the question came from FB AD Canvas
- String **refType**: Type of ref object. "brandcast", "FBADS", "SHORTLINK","FB-MESSAGE"
- JSON Object **refObject**: Object with information about reference ID above
- String **country**: Detected country of the user via IP (only for Brandchat Live Chat Plugin)
- String **countryCode**: Detected countryCode of the user via IP (only for Brandchat Live Chat Plugin)
- String **city**: Detected city of the user via IP (only for Brandchat Live Chat Plugin)
- String **time_zone**: Detected time zone of the user via IP (only for Brandchat Live Chat Plugin)

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
     postedByInfoEmail: 'almir.cajic@gmail.com',
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
     requestedClose: null,
     source: "w",//w for web plugin
     country: "Malaysia",
     countryCode: "MY"
} 
```

#### Message Object
Message object contains the following properties:

- String **messageText**: original value of the text (reply) user entered in the chat box
- String **text**: adjusted - lowercase - value of the text (reply) user entered in the chat box
- String **questionId **: Unique Id of the question. 
- String **id**: Unique Id of the chat message
- JSON Object **userInput**: object containing reponse provided by user when offered Rich Message Input input (TODO: link to more details about Input Rich Message)
- JSON Object **buttonInput**: object containing response provided by user when offered Rich Message Buttons input (TODO: link to more details about Buttons Rich Message)
- String **postedBy**: username (phone number) of the person that posted the question (it could be person who asked the question, any of the agents that join the conversation or other bots as bot_key of the bot)
- Date **postedDate**: date message is posted

Sample message object:
```Javascript
{  
       messageText: 'This is a MESSAGE text',
       text: 'this is a message text',
       questionId: 'cd2cf7f7-b971-422a-c65a-gq988af6a4qw9999',
	   id: '8b629bc6-e2f9-49ae-8297-f29aaaf6aafa9999',
       userInput: JSON Object,
       buttonInput: JSON Object,
       postedBy: 'username-of-person-or-bot-that-posted-this-message'
	   postedDate: '2016-09-21T10:25:37Z'
}
```

## Support:
- If you notice any bugs in the Brandchat Core library, please report at <https://github.com/almircajic/brandchat-bot-core/issues>

## Release History

* 1.0.0 Initial release
