const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert(user == expectedOutput, "This returns the correct user for the given email");
  });
  it('should return null for non-existing email', function() {
    const user = getUserByEmail("user3@example.com", testUsers)
    const expectedOutput = null;
    // Write your assert statement here
    assert(user == expectedOutput, "This email does not exist");
  });
});

