const express = require("express");

const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const bcrypt = require('bcrypt');

function generateRandomString() {
    var chars = '01234567890abcdefghijklmnopqrstuvwxyz';
    var result = '';
    for (var i = 6; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function urlsForUser(userID) {
  var userURLs = Object.keys(users).filter(key => users[key].userID === userID);
  return userURLs;
}


const urlDatabase = {
  "b2xVn2": {
    longURL :"http://www.lighthouselabs.ca",
    userID: "aJ48lW" 
  },
  "9sm5xK": {
    longURL : "http://www.google.com",
    userID: "aJ48lW"
  }
};

const users = {};
function getUserId(lookupObject,email) {
   let userId = null;
   for(let data in lookupObject) {
    if(lookupObject[data].email === email) {
      userId = data;
      break;
    }
  }
  return userId;
}

function passwordMatches(lookupObject,email,password) {
  let userId = getUserId(lookupObject,email);
  if(bcrypt.compareSync(password,lookupObject[userId].password)) {
    return true;
  }
  else {
    return false;
  }
}

function emailAlreadyExists(lookupObject,value) {
  let userId = getUserId(lookupObject,value);
  return userId == null ? false : true;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/login", (req, res) => {
  res.render('login');
});
app.get("/register", (req, res) => {
  res.render('register');
});
app.post("/register", (req, res) => {
    let newEmail = req.body.email;
    let newPassword = req.body.password;
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    if(!newEmail || !newPassword) {
      res.status(400).send("Email and password cannot be empty");
    }
    else if(emailAlreadyExists(users,newEmail)) {
      res.status(400).send("Email already exists");
    }
    else {
      let userId = generateRandomString();
      let newUser = {
        id : userId,
        email : newEmail,
        password: hashedPassword
      }
      users[userId] = newUser;
      res.cookie('user_id',userId);
      res.redirect('/urls');
    }    
});
app.get("/urls", (req, res) => {  
  var loggedInUserId = req.cookies['user_id'];
  const templateVars = { urls: urlsForUser(loggedInUserId), user: users[loggedInUserId]};
  res.render("urls_index",templateVars);
});
app.get("/urls/new", (req, res) => {
   var loggedInUserId = req.cookies['user_id'];
   if(loggedInUserId) {
      const templateVars = {
        user: users[loggedInUserId]
      };
      res.render("urls_new",templateVars);
   }
   else {
     res.render('/login');
   }
    
});  
app.get("/urls/:shortURL", (req, res) => {
  var loggedInUserId = req.cookies['user_id'];
  const templateVars = {
    user: users[loggedInUserId], 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});  

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});  

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/logout",(req,res) => {
   res.clearCookie("user_id");
   res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  let newURL = req.body;
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL : newURL.longURL,
    userID : res.cookie('user_id')
  }
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  let userID = res.cookie('user_id');
  if(userID && urlDatabase[req.params.id].userID === userID) {
    let newURL = req.body.newURL;
    let shortURL = req.params.id;
    urlDatabase[shortURL].longURL = newURL;
    res.redirect(`/urls`);
  }
  else {
    res.send('You are not authorized to edit this URL');
  }
});

app.post("/login",(req,res) => {
    let email = req.body.email;
    let password = req.body.password;
    if(!emailAlreadyExists(users,email)) {
      res.status(403).send('This email does not exist');
    }
    else if(!passwordMatches(users,email,password)) {
      res.status(403).send('Incorrect Password');      
    }
    else {
      res.cookie('user_id',getUserId(users,email));
      res.redirect('/urls');
    }
});

app.post("/urls/:id/delete",(req,res) => {
  let userID = res.cookie('user_id');
  if(userID && urlDatabase[req.params.id].userID === userID) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
  else {
    res.send('You are not authorized to delete this URL');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
