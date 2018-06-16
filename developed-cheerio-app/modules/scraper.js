const request = require('request');
const cheerio = require('cheerio');

let url = 'https://goo.gl/8y5kj8'

function scrapeSinglePage(url) {
    return new Promise((resolve, reject) => {
        request(url, function(err, resp, body){
            if (err) reject(err); 

            var $ = cheerio.load(body);
            var data = {
                jobTitle : $('.jobtitle font').text(),
                jobDescriptionTitle : $('#job_summary p:first-child b').text().slice(17),
                jobDescription : $('#job_summary p:nth-child(2)').text(),
            }
            console.log(data);
            resolve(data);
        });
    });
}

module.exports.scrapeSinglePage = scrapeSinglePage;

