const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index",templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});  
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});  

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});  

app.post("/urls", (req, res) => {
  let newURL = req.body;
  newURL.shortURL = generateRandomString();
  console.log(newURL);  // Log the POST request body to the console
  res.status(200).send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
