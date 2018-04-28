// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

var urlSchema = new mongoose.Schema({
  original: String,
  short: String
});

var Url = mongoose.model('Url', urlSchema);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/:url', (request, response) => {
  var {url} = request.params;
  Url.findOne({'short': url}, (err, data) => {
    if(err) response.send('Error reading from database.');
    var {original} = data;
    var regex = new RegExp('^(http|https)://', 'i');
    if(regex.test(original)) {
      response.redirect(301, original);
    } else {
      response.redirect(301, `https://${original}`);
    }
    
    // Moved Permanently to the Original URL
    response.redirect(301, original);
  });
});

app.get('/api/urlshortener/:url', (request, response) => {
  var {url} = request.params;
  var regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm
  
  if(regex.test(url)) {
    var short = Math.floor(Math.random() * 10000);
    var data = new Url({
      original: url,
      short
    });
    data.save((error) => {
      if(error) response.json({'Error': 'Saving to database failed.'});
    });
    
    response.json({
      "Original Url": url,
      "Shortened Version": short
    });
    
  } else {
    response.json({'Error': 'Invalid URL. Please enter a valid URL.'})
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
