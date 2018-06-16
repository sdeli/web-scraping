const puppeteer = require('puppeteer');
const scraper = require('./modules/scraper.js');
const fs = require('fs');
console.log(puppeteer);
let url = 'https://goo.gl/8y5kj8';

scraper.scrapeSinglePage(url)
.then((data) => {
    fs.writeFile('./downlads/data.txt', JSON.stringify(data), (err) => {
        if (err) console.log(err);
    });
})
.catch((err) => {
    console.log(err + '1');
});
