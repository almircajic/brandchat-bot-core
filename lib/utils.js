var axios = require('axios');

function BrandchatUtils(config) {
   this.token; 
   
   if (!(this instanceof BrandchatUtils)) {
      return new BrandchatUtils(config);
   }
}

BrandchatUtils.prototype.setToken = function(token) {
   this.token = token;
};

BrandchatUtils.prototype.post = function(url, attrs, callback, notoken){
   var thisInstance = this;

   var options = {
    uri: url,
    method: 'POST',
    data: attrs
   };
   if(thisInstance.token && !notoken){
      options.headers = {'X-Auth-Token': thisInstance.token};
   }

  //  request(options, function(error, response, body) {
  //     callback(error, response, body);
  //  });  
   axios(options)
    .then(response => {
      if(response){
        response.statusCode = response.status;
        callback(null, response, response.data);
      }
      else{
        callback(null, {statusCode: 500}, null);
      }
    })
    .catch(error => {
      console.log("utils post error", error);
      if (error.response) {
        error.response.statusCode = error.response.status;
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("error response", error.response);
        callback(error, error.response, error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.log("error request 500", error.request);
        callback(error, {statusCode: 500}, null);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("error message 500", error.message);
        callback(error, {statusCode: 500}, null);
      }
    });

};
BrandchatUtils.prototype.get = function(url, attrs, callback, notoken){
  var thisInstance = this;

  var options = {
   uri: url,
   method: 'GET',
   data: attrs
  };
  if(thisInstance.token && !notoken){
     options.headers = {'X-Auth-Token': thisInstance.token};
  }

  // request(options, function(error, response, body) {
  //    callback(error, response, body);
  // });  
  axios(options)
    .then(response => {
      if(response){
        response.statusCode = response.status;
        callback(null, response, response.data);
      }
      else{
        callback(null, {statusCode: 500}, null);
      }
    })
    .catch(error => {
      console.log("utils get error", error);
      if (error.response) {
        error.response.statusCode = error.response.status;
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("error response", error.response);
        callback(error, error.response, error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.log("error request 500", error.request);
        callback(error, {statusCode: 500}, null);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("error message 500", error.message);
        callback(error, {statusCode: 500}, null);
      }
    });

};
BrandchatUtils.prototype.createUuid = function(){
   function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
   }
   return (S4() + S4() + '-' + S4() + '-4' + S4().substr(0, 3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
};

module.exports = BrandchatUtils; 