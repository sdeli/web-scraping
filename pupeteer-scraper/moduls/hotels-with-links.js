const fs = require('fs');

let hotelInfosJSON = fs.readFileSync('../model/hotels-obj-json.json', 'utf-8');
let hotelInfosObj = JSON.parse(hotelInfosJSON);
let txtPathAndName = '../model/hotelHomePageLinks.txt';

//let hotelsWithLinksCount = getHotelsWithLinksCount(hotelInfosObj)
writeLinksIntoTxt();
//console.log('hotelsWithLinksCount: ');
//console.log(hotelsWithLinksCount);

function getHotelsWithLinksCount(hotelInfosObj) {
    return Object.values(hotelInfosObj).reduce((accumulator, currHotelInfo, index) => {
        if (currHotelInfo["company-link"]) {
            return accumulator + 1;
        }

        return accumulator;
    }, 0);
}

function writeLinksIntoTxt() {
    console.log('bejott');
    let links = Object.values(hotelInfosObj).reduce((accumulator, hotelobj, index) => {
        console.log('index:');
        console.log(index);
        console.log('hotelobj:');
        console.log(hotelobj);
        if (hotelobj["company-link"]) {
            return `${accumulator}${hotelobj["company-link"]}\n`;
        } else {
            return accumulator
        }
    });
    console.log('links:');
    console.log(links);
    fs.writeFileSync(txtPathAndName, links);
}