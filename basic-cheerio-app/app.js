const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

let url = 'https://goo.gl/8y5kj8'
let pageContentDest = fs.createWriteStream(`./downlads/indeed.html`);
//fs.chmod(path, mode, callback)


request(url, function(err, resp, body){
 var $ = cheerio.load(body);
 var jobTitle = $('.jobtitle font').text();
   // get the job description and abstract the first 17 characters
   var jobDescription = $('#job_summary p:first-child b').text().slice(17);
   console.log(jobDescription);
console.log(jobTitle);
})
.pipe(pageContentDest)
.on('err', function(){console.log(err);})
.on('finish', function(){console.log('all done');});
