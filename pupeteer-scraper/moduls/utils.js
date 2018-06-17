const fs = require('fs');
const puppeteer = require('puppeteer');

function writeIntoHotelinfosJson(allHotelsInfosObj){
    let allHotelsInfosJSON = JSON.stringify(allHotelsInfosObj);
    
    fs.writeFile('../model/hotel-infos.json', allHotelsInfosJSON, (err) => {  
        if (err) throw err;
        console.log('allHotelsInfosObj saved!');
    });
}

async function enterText(page, elemSelector, text) {
    // Sends a keydown, keypress/input, and keyup event for each character in the text.
    await page.type(elemSelector, text)
}

async function changeInnerText(page, elemSelector, newInnerText) {
    let paramters = [elemSelector, newInnerText];

    // change input fields value and get the new value
    let inputsChangedValue = await page.evaluate(function(elemSelector, newInnerText){
        let htmlElem = document.querySelector(elemSelector);
        htmlElem.innerText = newInnerText;
        console.log(htmlElem.innerText);
        return htmlElem.innerText;
    }, ...paramters)

    return inputsChangedValue;
}

async function changeInputsValue(page, inputsSelector, newinputVaule) {
    let paramters = [inputsSelector, newinputVaule];

    // change input fields value and get the new value
    let inputsChangedValue = await page.evaluate(function(inputsSelector, newinputVaule){
        let inputField = document.querySelector(inputsSelector);
        inputField.value = newinputVaule;

        return inputField.value;
    }, ...paramters)

    return inputsChangedValue;
}

async function clickBtn(page, btnSelector) {
    console.log(':');
    console.log(btnSelector);
    // change input fields value and get the new value
    await page.evaluate(function(btnSelector){
        let btn = document.querySelector(btnSelector);
        console.log(btn);
        btn.click();

    }, btnSelector)

    console.log('clicked');
}

async function getNextPageBtnObj(page, currPagiBtnInnerText, pagiBtnsObj) {
    var nextPagiBtnObj = await page.evaluate(function(currPagiBtnInnerText, pagiBtnsObj){
        var allPagiBtns = document.querySelectorAll(pagiBtnsObj.allsSel);

        for (var i = 0; i < allPagiBtns.length; i++) {
            console.log('for i: ' + i + '--------------------------');
            if  (i === allPagiBtns.length - 1) return false;

            if (allPagiBtns[i].innerText === currPagiBtnInnerText) {
                let retObj = {
                    nextHref : allPagiBtns[i].href,
                    innerText : allPagiBtns[i + 1].innerText
                }
                console.log('retObj:');
                console.log(retObj);
                return retObj;
            }
        }
    }, currPagiBtnInnerText, pagiBtnsObj);

    return nextPagiBtnObj;
}

async function extractHotelCards(page, hotelsCardsObj){
    let hotelinfos = {};
    let allHotelCardOnPage = await page.$$(hotelsCardsObj.mainDivsSel);

    for (let [i, hotelCard] of allHotelCardOnPage.entries()) {
        // statement
        try {
            console.log('for i: ' + i + '--------------------------');
            let hotelName = await hotelCard.$eval(hotelsCardsObj.namesSel, node => node.innerText);

            let hotelAddress = await getAddressFromProfPage(hotelCard, hotelsCardsObj);
            hotelinfos[hotelName] = hotelAddress;
            console.log(hotelName);
            console.log(hotelinfos[hotelName]);
            //let hotelAddress = await getAddressFromProfPage();
        } catch(e) {
            // statements
            console.log('for: ' + e);
        }
    }

    console.log(hotelinfos);
    return hotelinfos;
    
}

async function getAddressFromProfPage(hotelCard, hotelsCardsObj) {
    try {
        var browser = await puppeteer.launch({headless: true});
        var page = await browser.newPage();
        await page.setExtraHTTPHeaders({Referer: 'https://workingatbooking.com/vacancies/'})
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36');

        let profPageLink = await hotelCard.$eval(hotelsCardsObj.profPagesLinkSel, node => node.href);

        await page.goto(profPageLink)
        await page.waitForSelector(hotelsCardsObj.addressSel);

        let hotelAddress = await page.$eval(hotelsCardsObj.addressSel, span => span.innerText);

        browser.close()

        return hotelAddress;
    } catch(e) {
        // statements
        console.log('getadrr ' + e);
    }
}

module.exports.enterText = enterText;
module.exports.changeInnerText = changeInnerText;
module.exports.changeInputsValue = changeInputsValue;
module.exports.clickBtn = clickBtn;
module.exports.getNextPageBtnObj = getNextPageBtnObj;
module.exports.extractHotelCards = extractHotelCards;
module.exports.writeIntoHotelinfosJson = writeIntoHotelinfosJson;

/*
async function extractHotelCards(page, hotelsCardsObj){

    let allHotelsInfos = {};
    let allHotelCardsOnPage = await page.$$(hotelsCardsObj.mainDivsSel);

    for (let [i, hotelCard] of allHotelCardsOnPage.entries()) {
        // statement
        console.log('for: ' + i + ' --------------------------');
        let hotelName = await hotelCard.$eval(hotelsCardsObj.namesSel, node => {
            console.log(node.innerText);
            return node.innerText;
        });

        let hotelAddress = await getAddressFromProfPage(page, hotelCard, hotelsCardsObj);
        allHotelsInfos[hotelName] = hotelAddress;
        console.log('allHotelsInfos[hotelName]:');
        console.log(allHotelsInfos[hotelName]);
        console.log('hotelAddress');
        console.log(hotelAddress);
    }

    console.log(allHotelsInfos);
    return allHotelsInfos;
}

async function getAddressFromProfPage(page, hotelCard, hotelsCardsObj) {
    console.log('inProfpage:');
    let currLink = await page.evaluate(() => window.location.href)
    console.log(currLink === page.url());
    let profPageLink = await hotelCard.$eval(hotelsCardsObj.profPagesLinkSel, node => {
        console.log(node.href);
        return node.href;
    });
    console.log('profPageLink:');
    console.log(profPageLink);
    await page.goto(profPageLink)
    await page.waitForSelector(hotelsCardsObj.addressSel);

    let hotelAddress = await page.$eval(hotelsCardsObj.addressSel, span => {
    console.log(span.innerText);    
    return span.innerText;
    });

    console.log('hotelAddress:');
    console.log(hotelAddress);
    await page.goto(currLink)
    console.log('before wait:');
    await page.waitForSelector(hotelsCardsObj.mainDivsSel);
    console.log('after wait:');

    return hotelAddress;
}

const hotelsCardsObj = {
    mainDivsSel : '[data-hotelid]',
    uniqueSel : 'data-hotelid',
    namesSel : 'span.sr-hotel__name',
    profPagesLinkSel : 'a.hotel_name_link.url',
    addressSel :'span.hp_address_subtitle.js-hp_address_subtitle.jq_tooltip',
};

*/