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
const gotoUrlB = 'https://www.booking.com/searchresults.html?aid=304142&label=gen173rf-1FCAEoggJCAlhYSDNYA2hpiAEBmAExwgEDeDExyAEM2AEB6AEB-AECkgIBeaICFHdvcmtpbmdhdGJvb2tpbmcuY29tqAID&sid=6bc2acc518cb0d1138f115ed2224c72b&class_interval=1&dest_id=607&dest_type=region&from_sf=1&group_adults=2&group_children=0&label_click=undef&lsf=ht_id%7C204%7C1535&map=1&nflt=ht_id%3D204%3Bht_id%3D216%3B&no_rooms=1&percent_htype_hotel=1&raw_dest_type=region&room1=A%2CA&sb_price_type=total&search_selected=1&src=index&ss=Tirol%2C%20Austria&ss_raw=Tirol%2C%20Austria&ssb=empty&rows=15&offset=510';
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
    profPagesLinkSel : 'a.hotel_name_link.url',
    addressSel :'span.hp_address_subtitle.js-hp_address_subtitle.jq_tooltip'
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

const enterText = require('../moduls/helpers.js').enterText;
const clickBtn = require('../moduls/helpers.js').clickBtn;
const changeInnerText = require('../moduls/helpers.js').changeInnerText;
const getNextPageBtnObj = require('../moduls/helpers.js').getNextPageBtnObj;
const writeObjIntoJsonFile = require('../moduls/helpers.js').writeObjIntoJsonFile;
const extractHotelCards = require('../moduls/helpers.js').extractHotelCards;
const appendObjToJsonFile = require('../moduls/helpers.js').appendObjToJsonFile;
//const scrapeGoogle = require('../moduls/google-search.js');

let allHotelsInfosObj = {};

// In pupeteer most methods are returning a promise
// so we need to wait on anything
async function createScrapingLogic() {
    try {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({Referer: 'https://workingatbooking.com/vacancies/'})
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36');
        await page.goto(mainPageUrl);

        await getToSearchResultspage(page);
        await page.waitForSelector(closeMapLightboxSel);
      
        await clickBtn(page, closeMapLightboxSel);

        await clickBtn(page, radioBtns.hotels);
        await page.waitForSelector(`${radioBtns.hotels}${waitforSels.activeFilteClass}`);
        
        await clickBtn(page, radioBtns.guesthouse);
        await page.waitForSelector(`${radioBtns.guesthouse}${waitforSels.activeFilteClass}`);
       
        await page.waitForSelector(pagiBtnsObj.allsSel);
        await extractPaginatedPages(page, pagiBtnsObj, hotelsCardsObj, '35');
        
        writeObjIntoJsonFile(allHotelsInfosObj, '../model/plain-hotel-infos.json');

        //await scrapeGoogle(allHotelsInfosObj, 100)
        //writeObjIntoJsonFile(allHotelsInfosObj, '../model/hotel-infos.json');
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
    let enterCheckOutDate = await changeInnerText(page, checkOutMonthSpanSel, checkOutDate);
    let enterAdultsCount = await changeInnerText(page, adultsCountSel, adultsCount);
    let enterChildrensCount = await changeInnerText(page, chilrendCountSel, childrenCount);
    await clickBtn(page, searchBtnSel);
}

async function extractPaginatedPages(page, pagiBtnsObj, hotelsCardsObj, currPagiBtnInnerText) {
   
    let hotelInfosFromPageObj = await extractHotelCards(page, hotelsCardsObj);
    allHotelsInfosObj = Object.assign(allHotelsInfosObj, hotelInfosFromPageObj);
    appendObjToJsonFile(allHotelsInfosObj, '../model/hotel-infos.json') 

    let nextPagiBtnObj = await getNextPageBtnObj(page, currPagiBtnInnerText, pagiBtnsObj);
    console.log('nextPagiBtnObj:');
    console.log(Boolean(nextPagiBtnObj));

    if (nextPagiBtnObj) {
        console.log('in');
        await page.goto(nextPagiBtnObj.nextHref)
        await page.waitForSelector(`${pagiBtnsObj.li}${pagiBtnsObj.activesSel}`);

        extractPaginatedPages(page, pagiBtnsObj, hotelsCardsObj, nextPagiBtnObj.innerText);
        
    } else {
        return 'all pages extracted';
    }     
}    

createScrapingLogic();