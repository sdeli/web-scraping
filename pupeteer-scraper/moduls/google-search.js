/*
res : {
    url: The URL requested from Google for this search and page
    query: The search provided on this call
    start: The index of the first link across the links of all pages
    links: { An array with all the link objects
        title:
        link:
        description:
        href:
    },
    body: The HTML of the loaded page
    next: A method that invokes the originally specified callback with next page results
    $: A cheerio instance of the loaded page
}
*/
const jsonfile = require('jsonfile')
const fs = require('fs');
const url = require('url');
const google = require('google');
let searchTearm = 'allinurl:hotel engl';
let bannedDomainsArr = [
    '.booked.',
    'solden-hotels',
    '.findhotelswebsite.'
]
//console.log(hotelInfosObj);
scrapeGoogle(hotelInfosObj, 100);

async function createLogic(hotelsInfosObj, resPerPage){
    for (key in hotelsInfosObj) {
        console.log('key:');
        console.log(key);
        let searchResLinks = await getGoogleSrchResLinks(key, resPerPage);
        let companyLinks = getCompanyLinks(searchResLinks, key);
        hotelsInfosObj[key]['company-links'] = companyLinks;
    }

    return hotelsInfosObj;

}

function getGoogleSrchResLinks(searchTearm, resPerPage){
    console.log(searchTearm);
    google.resultsPerPage = resPerPage;

    return new Promise(function(resolve, reject) {
        google(searchTearm, function (err, res){
          if (err) console.error(err)
            console.log('res.links:');
            console.log(res);
            console.log('-------------------------------:');
            console.log(res.links);
            var linksArr = res.links.reduce((accumulator, linkObj, i) =>{
                if (linkObj.href && linkObj.href !== '') {
                    return [...accumulator, linkObj.href]
                }

                return accumulator;
            }, []);

            resolve(linksArr);
        });
    });
} 

function getCompanyLinks(linksArr, hotelName) {
    return linksArr.reduce((accumulator, link, currIndex) => {
        let isCompanyLink = checkIfCompanyLink(link, hotelName);    

        if (isCompanyLink) {
            return [...accumulator, link]
        }
        return accumulator;
    }, []);
}

function checkIfCompanyLink(link, hotelName) {
    let domainName = url.parse(link, true).hostname;
    let queryWordsArr = hotelName.split(" ");
    isBannedDomain = checkForBannedDomains(domainName);
    console.log('domainName:');
    console.log(domainName);
    console.log('isBannedDomain:');
    console.log(isBannedDomain);
    if (!isBannedDomain) return false;

    return queryWordsArr.every((word) => domainName.indexOf(word) > -1);
}

function checkForBannedDomains(domainName){
    return bannedDomainsArr.every(bannedDomain => domainName.indexOf(bannedDomain) > -1);
}    

module.exports = createLogic; 