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

//matches if the password match the entry to the corresponding emailID in DB
function passwordMatches(lookupObject,email,password) {
  let userId = helpers.getUserId(lookupObject,email);
  if(bcrypt.compareSync(password,lookupObject[userId].password)) {
    return true;
  }
  else {
    return false;
  }
}

// URLs DATABASE

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

// USERS DATABASE
const users = {};

app.get("/", (req, res) => {
  res.redirect('/urls');
});
app.get("/login", (req, res) => {
  res.render('login',{errorMessage:""});
});
app.get("/register", (req, res) => {
  res.render('register',{errorMessage:""});
});
app.post("/register", (req, res) => {
    let newEmail = req.body.email;
    let newPassword = req.body.password;
    //encypt the password to make it secure
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    if(!newEmail || !newPassword) {
      let message = "Email and password cannot be empty";
      //send status code and error messafe
      res.status(400).render("register",{errorMessage:message});
    }
    else if(helpers.emailAlreadyExists(users,newEmail)) {
      let message = "Email already exists";
      //send status code and error messafe
      res.status(400).render("register",{errorMessage:message});
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
      res.status(200).redirect('/urls');
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
      res.status(200).render("urls_new",templateVars);
    }
    else {
      //redirect user to login page if he tries to create a new URL
      res.status(200).redirect('/login');
    }  
});  
app.get("/urls/:shortURL", (req, res) => {
  var loggedInUserId = req.session.user_id;
  if(!loggedInUserId) {
    res.status(401).send('You are not logged in');
  }
  else {
    //look if logged in user is authorized to access the requested URL
    if(!(req.params.shortURL in helpers.urlsForUser(loggedInUserId,urlDatabase))){
      res.status(403).send('You are not authorized to access this URL');
    }
    else {
      const templateVars = {
        user: users[loggedInUserId], 
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL].longURL
      };
      res.render("urls_show", templateVars);
    }
  }
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});  

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});  

app.get("/u/:shortURL", (req, res) => {
  if(req.params.shortURL in urlDatabase) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    //redirect the user to the actual long URL
    res.redirect(longURL);
  }
  else {
    res.status(404).send('This entry does not exist in DB');
  }
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
    res.status(200).redirect(`/urls`);
  }
  else {
    res.status(403).send('You are not authorized to edit this URL');
  }
});

app.post("/login",(req,res) => {
    let email = req.body.email;
    let password = req.body.password;
    //check if input matches database or not
    if(!helpers.emailAlreadyExists(users,email)) {
      var message = 'This email does not exist';
      res.status(403).render('login',{errorMessage:message});
    }
    else if(!passwordMatches(users,email,password)) {
      var message = 'Incorrect Password';
      res.status(403).render('login',{errorMessage:message});  
    }
    else {
      //get userID of the the logged in user
      let userId = helpers.getUserId(users,email);
      req.session.user_id = userId;
      res.status(200).redirect('/urls');
    }
});

app.post("/urls/:id/delete",(req,res) => {
  let userID = req.session.user_id;
  if(userID && urlDatabase[req.params.id].userID === userID) {
    delete urlDatabase[req.params.id];
    res.status(200).redirect('/urls');
  }
  else {
    res.status(403).send('You are not authorized to delete this URL');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});