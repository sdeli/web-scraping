/*
sel : slector,
cont : container,
arr : array,
obj : object,
dest : destionation,
cahr : character
*/
const puppeteer = require('puppeteer');
const mainPageUrl = 'https://www.booking.com/';
const mainPageSelToWait = '.xp__fieldset.accommodation'
const searchResPageSelToWait = '.xp__fieldset.accommodation'
const findDealsCont = '.xpi__content__container';

const destInputSel = 'input#ss'; 
const destRegion = 'Tirol, Austria';
const liToClickInDropDown = '[data-list] > [data-label="Tirol, Austria"]'

const checkInMonthSpanSel = 'div[data-placeholder="Check-in"]';
const checkInDate = "Wed, Oct 17";

const checkOutMonthSpanSel = 'div[data-placeholder="Check-out"]';
const checkOutDate = "Thu, Oct 18";

const adultsCountSel = 'span[data-adults-count]';
const adultsCount = "1 adult";

const chilrendCountSel = 'span[data-children-count]';
const childrenCount = '1 Children';

const searchBtnSel = 'button.sb-searchbox__button';

const enterText = require('./moduls/utils.js').enterText;
const clickBtn = require('./moduls/utils.js').clickBtn;
const changeInnerText = require('./moduls/utils.js').changeInnerText;

// In pupeteer most methods are returning a promise
// so we need to wait on anything
async function createScrapingLogic() {
    try {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36');
        await page.goto(gotoUrl);
        await page.waitForSelector(mainPageSelToWait);

        getToSearchResultspage(page);
        await page.waitForSelector(searchResPageSelToWait);



    } catch(e) {
        console.log('our error: ' + e);
    }
}

async function getToSearchResultspage(page){
    let enterDestination = await enterText(page, destInputSel, destRegion);
    console.log(enterDestination);

    await page.waitForSelector(liToClickInDropDown);

    await clickBtn(page, liToClickInDropDown);

    let enterCheckInDate = await changeInnerText(page, checkInMonthSpanSel, checkInDate);
    console.log(enterCheckInDate);
    
    let enterCheckOutDate = await changeInnerText(page, checkOutMonthSpanSel, checkOutDate);
    console.log(enterCheckOutDate);

    let enterAdultsCount = await changeInnerText(page, adultsCountSel, adultsCount);
    console.log(enterAdultsCount);

    let enterChildrensCount = await changeInnerText(page, chilrendCountSel, childrenCount);
    console.log('enterChildrensCount');
    console.log(enterChildrensCount);

    await clickBtn(page, searchBtnSel);
}

async function extractPaginatedPages(page, pagiBtnsObj, hotelsCardsObj, currPagiBtnInnerText) {
        await page.evaluate(function(pagiBtnsObj, hotelsCardsObj){
           //extractHotelCards(hotelsCardsObj);
        }, ...[pagiBtnsObj, hotelsCardsObj])        

    var nextPagiBtn = await page.evaluate(function(currPagiBtnInnerText, pagiBtnsObj){
        var allPagiBtns = document.querySelectorAll(pagiBtnsObj.allsSel);

        for (var i = 0; i < allPagiBtns.length; i++) {
            if  (i === allPagiBtns.length - 1) return false;

            if (allPagiBtns[i].innerText === currPagiBtnInnerText) {
                let retObj = {
                    sel : `${pagiBtnsObj.li}:nth-child(${i + 2}) a`,
                    innerText : allPagiBtns[i + 1].innerText
                }

                return retObj;
            }
        }
    }, currPagiBtnInnerText, pagiBtnsObj);

    if (nextPagiBtn) {
        await page.click(nextPagiBtn.sel)

        setTimeout(function(){
            extractPaginatedPages(page, pagiBtnsObj, hotelsCardsObj, nextPagiBtn.innerText);
        }, 7000)
        
    } else {
        return 'all pages extracted'
    }     
}

createScrapingLogic();



