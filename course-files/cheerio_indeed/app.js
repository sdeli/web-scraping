var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var app = express();
var port = 8000;

var url = "https://goo.gl/8y5kj8";

request(url, function(err, resp, body) {
  var $ = cheerio.load(body);
  var jobTitle = $('.jobtitle font').text();
  var jobDescription = $('.summary p b').text().slice(17, 29);
  var jobLocation = $('.location').text();

  var obj = {
    jobTitle,
    jobDescription,
    jobLocation
  }

  console.log(obj);
});

app.listen(port, function() {
  console.log('app listening on port ' + port);
});