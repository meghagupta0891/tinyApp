const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
    var chars = '01234567890abcdefghijklmnopqrstuvwxyz';
    var result = '';
    for (var i = 6; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

function emailAlreadyExists(lookupObject,value) {
  let emailExists = false;
  for(let data in lookupObject) {
    if(lookupObject[data].email === value) {
      emailExists = true;
      break;
    }
  }
  return emailExists;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/register", (req, res) => {
  res.render('register');
});
app.post("/register", (req, res) => {
    let newEmail = req.body.email;
    let newPassword = req.body.password;
    if(!newEmail || !newPassword) {
      res.status(400).send("Username and password cannot be empty");
    }
    else if(emailAlreadyExists(users,newEmail)) {
      res.status(400).send("Email already exists");
    }
    else {
      let userId = generateRandomString();
      let newUser = {
        id : userId,
        email : newEmail,
        password: newPassword
      }
      users[userId] = newUser;
      res.cookie('user_id',userId);
      res.redirect('/urls');
    }    
});
app.get("/urls", (req, res) => {  
  var loggedInUserId = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user: users[loggedInUserId]};
  res.render("urls_index",templateVars);
});
app.get("/urls/new", (req, res) => {
   var loggedInUserId = req.cookies['user_id'];
    const templateVars = {
       user: users[loggedInUserId]
    };
    res.render("urls_new",templateVars);
});  
app.get("/urls/:shortURL", (req, res) => {
  var loggedInUserId = req.cookies['user_id'];
  const templateVars = {
    username: users[loggedInUserId], 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
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
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/logout",(req,res) => {
   res.clearCookie("user_id");
   res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  let newURL = req.body;
  newURL.shortURL = generateRandomString();
  urlDatabase[newURL.shortURL] = newURL.longURL;
  res.redirect(`/urls/${newURL.shortURL}`);
});

app.post("/urls/:id", (req, res) => {
    let newURL = req.body.newURL;
    let shortURL = req.params.id;
    urlDatabase[shortURL] = newURL;
    res.redirect(`/urls`);
});

app.post("/login",(req,res) => {
    let username = req.body.username;
    res.redirect('/urls');
});

app.post("/urls/:id/delete",(req,res) => {
   delete urlDatabase[req.params.id];
   res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
