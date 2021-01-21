const express = require("express");

const helpers = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcrypt');

const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}))

function passwordMatches(lookupObject,email,password) {
  let userId = helpers.getUserId(lookupObject,email);
  if(bcrypt.compareSync(password,lookupObject[userId].password)) {
    return true;
  }
  else {
    return false;
  }
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

app.get("/", (req, res) => {
  res.redirect('/urls');
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
    else if(helpers.emailAlreadyExists(users,newEmail)) {
      res.status(400).send("Email already exists");
    }
    else {
      let userId = helpers.generateRandomString();
      let newUser = {
        id : userId,
        email : newEmail,
        password: hashedPassword
      }
      users[userId] = newUser;
      req.session.user_id = userId;
      res.redirect('/urls');
    }    
});
app.get("/urls", (req, res) => {  
  var loggedInUserId = req.session.user_id;
  const templateVars = { urls: helpers.urlsForUser(loggedInUserId,urlDatabase), user: users[loggedInUserId]};
  res.render("urls_index",templateVars);
});
app.get("/urls/new", (req, res) => {
  var loggedInUserId = req.session.user_id;
   if(loggedInUserId) {
      const templateVars = {
        user: users[loggedInUserId]
      };
      res.render("urls_new",templateVars);
   }
   else {
     res.render('login');
   }
    
});  
app.get("/urls/:shortURL", (req, res) => {
  var loggedInUserId = req.session.user_id;
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

app.get("/logout",(req,res) => {
   req.session = null;
   res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  let newURL = req.body;
  var shortURL = helpers.generateRandomString();
  urlDatabase[shortURL] = {
    longURL : newURL.longURL,
    userID : req.session.user_id
  }
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
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
    if(!helpers.emailAlreadyExists(users,email)) {
      res.status(403).send('This email does not exist');
    }
    else if(!passwordMatches(users,email,password)) {
      res.status(403).send('Incorrect Password');      
    }
    else {
      res.cookie('user_id',helpers.getUserId(users,email));
      res.redirect('/urls');
    }
});

app.post("/urls/:id/delete",(req,res) => {
  let userID = req.session.user_id;
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