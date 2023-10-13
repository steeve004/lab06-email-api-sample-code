let SERVER_NAME = 'user-api'
let PORT = 3000;
let HOST = '127.0.0.1';

const NewsAPI = require('newsapi');
const apikey = 'YOUR_API_KEY'; // replace with the API key obtained in https://newsapi.org/......
const newsapi = new NewsAPI(apikey);

const nodemailer = require("nodemailer");

let errors = require('restify-errors');
let restify = require('restify')

  // Get a persistence engine for the users
  , usersSave = require('save')('users')

  // Create the restify server
  , server = restify.createServer({ name: SERVER_NAME})

  server.listen(PORT, HOST, function () {
  console.log('Server %s listening at %s', server.name, server.url)
  console.log('**** Resources: ****')
  console.log('********************')
  console.log(' /users')
  console.log(' /users/:id')
  console.log(' /news [POST] { "category": "Technology" }')
  console.log(' /emails [POST] { "mailfrom": "hello@test.com", "mailto":"peter@example.com", "subject": "MAPD713 Info", "text": "First email"}')
})

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

// Get all users in the system
server.get('/users', function (req, res, next) {
  console.log('GET /users params=>' + JSON.stringify(req.params));

  // Find every entity within the given collection
  usersSave.find({}, function (error, users) {

    // Return all of the users in the system
    res.send(users)
  })
})

// Get a single user by their user id
server.get('/users/:id', function (req, res, next) {
  console.log('GET /users/:id params=>' + JSON.stringify(req.params));

  // Find a single user by their id within save
  usersSave.findOne({ _id: req.params.id }, function (error, user) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new Error(JSON.stringify(error.errors)))

    if (user) {
      // Send the user if no issues
      res.send(user)
    } else {
      // Send 404 header if the user doesn't exist
      res.send(404)
    }
  })
})

// Create a new user
server.post('/users', function (req, res, next) {
  console.log('POST /users params=>' + JSON.stringify(req.params));
  console.log('POST /users body=>' + JSON.stringify(req.body));

  // validation of manadatory fields
  if (req.body.name === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('name must be supplied'))
  }
  if (req.body.age === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('age must be supplied'))
  }

  let newUser = {
		name: req.body.name, 
		age: req.body.age
	}

  // Create the user using the persistence engine
  usersSave.create( newUser, function (error, user) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new Error(JSON.stringify(error.errors)))

    // Send the user if no issues
    res.send(201, user)
  })
})

// Update a user by their id
server.put('/users/:id', function (req, res, next) {
  console.log('POST /users params=>' + JSON.stringify(req.params));
  console.log('POST /users body=>' + JSON.stringify(req.body));
  // validation of manadatory fields
  if (req.body.name === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('name must be supplied'))
  }
  if (req.body.age === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('age must be supplied'))
  }
  
  let newUser = {
		_id: req.body.id,
		name: req.body.name, 
		age: req.body.age
	}
  
  // Update the user with the persistence engine
  usersSave.update(newUser, function (error, user) {
    // If there are any errors, pass them to next in the correct format
    if (error) return next(new Error(JSON.stringify(error.errors)))

    // Send a 200 OK response
    res.send(200)
  })
})

// Delete user with the given id
server.del('/users/:id', function (req, res, next) {
  console.log('POST /users params=>' + JSON.stringify(req.params));
  // Delete the user with the persistence engine
  usersSave.delete(req.params.id, function (error, user) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new Error(JSON.stringify(error.errors)))

    // Send a 204 response
    res.send(204)
  })
})

// redirect call to news API
server.post('/news', function (req, res, next) {
  console.log('POST /news body=>' + JSON.stringify(req.body));
  // validation of manadatory fields
  if (req.body.category === undefined ) {
    return next(new errors.BadRequestError('category must be supplied'))
  }
  // call news API
  newsapi.v2.sources({
    category: req.body.category,
    language: 'en',
    country: 'us'
  }).then(response => {
    console.log(response);
    res.send(200, response);
    return next();
  }).catch((error)=>{
      return next(new Error(JSON.stringify(error.errors)));
  });
})

async function sendEmail(requestBody) {
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "USER", // change to user generated in https://mailtrap.io/ account
      pass: "PASSWORD" // change to password generated in https://mailtrap.io/ account
    }
  });
  // send mail with defined transport object
  let info = await transport.sendMail({
    from: requestBody.mailfrom,
    to: requestBody.mailto,
    subject: requestBody.subject,
    text: requestBody.text
  });
  console.log("Message sent: %s", info.messageId);
  return info;
}

// redirect call to email API - https://mailtrap.io/
server.post('/emails', function (req, res, next) {
  console.log('POST /emails body=>' + JSON.stringify(req.body));
  // validation of manadatory fields
  if (req.body.mailfrom === undefined ) {
    return next(new errors.BadRequestError('mailfrom must be supplied'))
  }
  if (req.body.mailto === undefined ) {
    return next(new errors.BadRequestError('mailto must be supplied'))
  }  
  if (req.body.subject === undefined ) {
    return next(new errors.BadRequestError('subject must be supplied'))
  }  
  if (req.body.text === undefined ) {
    return next(new errors.BadRequestError('text must be supplied'))
  }  
  // call email API - https://mailtrap.io/
  sendEmail(req.body).then(response => {
    //console.log(response);
    res.send(200, response);
    return next();
  }).catch((error)=>{
      return next(new Error(JSON.stringify(error.errors)));
  });
})
