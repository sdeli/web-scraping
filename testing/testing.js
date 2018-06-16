//document.querySelector('.sr_pagination_item:nth-child(1).current');

/*
sel : slector,
cont : container,
arr : array,
obj : object,
dest : destionation,
cahr : character,
btn : button,
srch : search,
res : result,
pagi : pagination,
prof : profile,
curr : current
*/
const puppeteer = require('puppeteer');
const mainPageUrl = 'https://www.booking.com/';
const gotoUrlB = 'https://www.booking.com/searchresults.html?label=gen173nr-1DCAEoggJCAlhYSDNYBGhpiAEBmAExwgEDeDExyAEM2AED6AEB-AECkgIBeagCAw&sid=6c4f44e4d74371e2d67d59a79a5137a2&checkin_month=11&checkin_monthday=5&checkin_year=2018&checkout_month=11&checkout_monthday=6&checkout_year=2018&class_interval=1&dest_id=607&dest_type=region&dtdisc=0&from_sf=1&group_adults=1&group_children=0&inac=0&index_postcard=0&label_click=undef&map=1&no_rooms=1&postcard=0&raw_dest_type=region&room1=A&sb_price_type=total&search_selected=1&src=index&src_elem=sb&ss=Tirol%2C%20Austria&ss_all=0&ss_raw=tir&ssb=empty&sshis=0&rows=15';
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
const closeMapLightboxSel = '#close_map_lightbox';
const pagiBtnsObj = {
    li : '.sr_pagination_item',
    allsSel : '.sr_pagination_item a',
    activesSel : `.current`
};
const hotelsCardsObj = {
    mainDivsSel : '[data-hotelid]',
    uniqueSel : 'data-hotelid',
    namesSel : 'span.sr-hotel__name',
    profPagesLinkSel : 'a.hotel_name_link.url'
};
let radioBtns = {
    guesthouse : '[data-id="ht_id-216"]',
    hotels : '[data-id="ht_id-204"]'
}
let waitforSels = {
    activeFilteClass : '.filterelement.active',
    mainPageSelToWait : '.xp__fieldset.accommodation',
    searchResPageSelToWait : '#close_map_lightbox',
}

createScrapingLogic();

async function createScrapingLogic() {
    try {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.once('load', () => console.log('Page loaded!' + searchBtnSel));
        await page.setExtraHTTPHeaders({Referer: 'https://workingatbooking.com/vacancies/'})
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36');
        await page.goto(gotoUrlB);
        await page.waitForSelector(closeMapLightboxSel);
        await clickBtn(page, closeMapLightboxSel);

        
        await page.waitForSelector(pagiBtnsObj.allsSel);
        var x = await extractPaginatedPages(page, pagiBtnsObj, hotelsCardsObj, '1')
        console.log(x);

       // await clickBtn(page, radioBtns.hotels);
        //await page.waitForSelector(`${radioBtns.hotels}${waitforSels.activeFilteClass}`);
       // await clickBtn(page, radioBtns.guesthouse);
       // await page.waitForSelector(`${radioBtns.guesthouse}${waitforSels.activeFilteClass}`);
       
        //await extractAllSrchResPages(page, pagiBtnsObj, hotelsCardsObj)
       
    } catch(e) {
        console.log('our error: ' + e);
    }
}

/*  
    allHotels = {}
    loop threw all pagi buttons
        let hotelinfosObj = loop threw all cards
        allHotels[hotelInfosObj.name] = {
                adress : hotelInfosObj.adress
        }
        loop threw all cards
            hotelInfosObj = extract name and adress

                reserve curr link : window.location.href
                get hotel name
                extract hotels sub-page link
                got to link
                wait for loading sel
                get adress
                go back to prev link
                return {adress, name}

        when cards finsihes => 
        click next pagi button
        wait for current selector
        return all hotels
*/
    // The paginations buttons sel gives a different result at every iteration
    // so we need to identify the current pagiBtn by the next pagibtn param from the prev iteration
    // and the next pagibtn which will be the curr btn of the next iteration
async function extractPaginatedPages(page, pagiBtnsObj, hotelsCardsObj, currPagiBtnInnerText) {
    console.log('started extractPaginatedPages');
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

async function extractHotelCards(hotelsCardsObj){
    let cardsSel = hotelsCardsObj.mainDivsSel;
    let hotelCards = document.querySelectorAll(cardsSel);
    let namesSel = hotelsCardsObj.namesSel;
    let uniqueSel = hotelsCardsObj.uniqueSel;
    let profPagesLinkSel = hotelsCardsObj.profPagesLinkSel;
    let currLink = window.location.href;

    for (let [i, card] of hotelCards.entries()) {
        let thisHotelsId = card.getAttribute(uniqueSel);
        let hotelName = document.querySelector(`[${uniqueSel}=\'${thisHotelsId}\'] ${namesSel}`).innerText;
        let profPagesLink = document.querySelector(`[${uniqueSel}=\'${thisHotelsId}\'] ${profPagesLinkSel}`).getAttribute('href');
        profPagesLink = 'https://www.booking.com' + profPagesLink;
        //var address = await extractProfPage();
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
    // change input fields value and get the new value
    try {
        await page.evaluate(function(btnSelector){
            let btn = document.querySelector(btnSelector);
            btn.click();

        }, btnSelector)
    } catch(e) {
        // statements
        console.log('our err: ' + e);
    }
}


