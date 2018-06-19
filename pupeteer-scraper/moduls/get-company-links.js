
const puppeteer = require('puppeteer');
const googlePage = 'https://www.google.de/';
const writeObjIntoJsonFile = require('../moduls/helpers.js').writeObjIntoJsonFile;
let hotelName = 'hotel alpin spa tuxerhof';

const srchPageSels = {
    srchField : '.gsfi',
    submitBtn : '[value="Google Search"]'
}

const srchResPageSels = {
    resSel : "#rhscol",
    companyWebsiteA : '.kp-header .ab_button'
}

let allHotelsObj = require('../model/get-company-links-securityt.json');

async function createLogic(allHotelsObj) {
    console.log('company links extraction started');
    let newHotelsObj = Object.assign(allHotelsObj)

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36');

    await page.goto(googlePage);
    await page.waitForSelector(srchPageSels.srchField);
    var i = 0

    for (hotelName in newHotelsObj) {
        try {
            if (newHotelsObj[hotelName]['company-link'] || newHotelsObj[hotelName]['no-website-btn']) {
                console.log('has company link');
                console.log('same iterator values');
                continue;
            }

            console.log('for:' + i + '--------------------------------');
            console.log('hotelName: ' + hotelName);
            await page.type(srchPageSels.srchField, hotelName);
            await page.click(srchPageSels.submitBtn)
            await page.waitForSelector(srchResPageSels.resSel);

            let isCompanyWebsiteBtn = await checkIfElemExist(page, srchResPageSels.companyWebsiteA);

            if (!isCompanyWebsiteBtn) {
                console.log('no website btn');
                console.log('same iterator value');
                await waitRandomSeconds(2,7);
                newHotelsObj[hotelName]['no-website-btn'] = true;
                await page.goto(googlePage);
                await page.waitForSelector(srchPageSels.srchField);
                continue;
            } else {
                newHotelsObj[hotelName]['company-link'] = await page.$eval(srchResPageSels.companyWebsiteA, anchorTag => anchorTag.href);
                i++;
                console.log('newHotelsObj[\'company-link\']:');
                console.log(newHotelsObj[hotelName]['company-link']);
            } // else

            console.log(i);
            await page.goto(googlePage);
            await page.waitForSelector(srchPageSels.srchField);
            await waitRandomSeconds(2,7);

            console.log('i % 10');
            console.log(i % 10);
            if (i % 10 === 0 ) {
                console.log('security saving');
                writeObjIntoJsonFile(newHotelsObj, '../model/get-company-links-securityt.json');
            }
        } catch(e) {
            console.log('security saving');
            writeObjIntoJsonFile(newHotelsObj, '../model/get-company-links-securityt.json');
            console.log(e);
        } // catch
    } // for

    writeObjIntoJsonFile(newHotelsObj, '../model/get-company-links-securityt.json');
    console.log('all hotels processed');
    return;
}

async function checkIfElemExist(page, elemSel) {
    return page.evaluate(function(elemSel) {
        let elem = document.querySelector(elemSel);

        if (elem && elem.innerText === 'Website') return true
        else return false

    }, elemSel);
}

function waitRandomSeconds(minSec, maxSec) {
    return new Promise(resolve => {
        let difference = maxSec - minSec;
        let randomSec = (Math.floor(Math.random() * difference) + minSec + 1).toString();
        console.log('waiting ' + randomSec + ' seconds');

        setTimeout(function() {
          resolve('waited ' + randomSec + ' seconds');
          console.log('waited ' + randomSec + ' seconds');
        }, `${randomSec}000`);
    });
}
'Website'
createLogic(allHotelsObj);

module.exports = createLogic;