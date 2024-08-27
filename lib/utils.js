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
      callback(null, response, response.data);
    })
    .catch(error => {
      callback(error, null, null);
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
      callback(null, response, response.data);
    })
    .catch(error => {
      callback(error, null, null);
    });

};
BrandchatUtils.prototype.createUuid = function(){
   function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
   }
   return (S4() + S4() + '-' + S4() + '-4' + S4().substr(0, 3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
};

module.exports = BrandchatUtils; 