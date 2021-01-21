const helpers =  {
    getUserByEmail : function(email,lookupObject) {
        let userId = null;
        for(let data in lookupObject) {
         if(lookupObject[data].email === email) {
           userId = data;
           break;
         }
       }
       return userId;
    },
    getUserId : function(lookupObject,email) {
        let userId = null;
        for(let data in lookupObject) {
         if(lookupObject[data].email === email) {
           userId = data;
           break;
         }
       }
       return userId;
    },    
    emailAlreadyExists: function(lookupObject,value) {
       let userId = this.getUserId(lookupObject,value);
       return userId == null ? false : true;
    },
    generateRandomString: function() {
        var chars = '01234567890abcdefghijklmnopqrstuvwxyz';
        var result = '';
        for (var i = 6; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    },
    urlsForUser : function(userID,urls) {
      console.log('user id is ',userID);
      let userURLs = {};
      for(let url in urls) {
          if(urls[url].userID === userID) {
              userURLs[url] = urls[url];
          }
      }
      console.log('urls are'+ JSON.stringify(userURLs));
      return userURLs;
    } 
}

module.exports = helpers;