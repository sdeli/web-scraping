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
const gotoUrlB = 'https://www.booking.com/searchresults.html?aid=304142&label=gen173nr-1DCAEoggJCAlhYSDNYBGhpiAEBmAExwgEDeDExyAEM2AED6AEB-AECkgIBeagCAw&sid=6c4f44e4d74371e2d67d59a79a5137a2&checkin_month=11&checkin_monthday=5&checkin_year=2018&checkout_month=11&checkout_monthday=6&checkout_year=2018&class_interval=1&dest_id=607&dest_type=region&dtdisc=0&from_sf=1&group_adults=1&group_children=0&inac=0&index_postcard=0&label_click=undef&lsf=ht_id%7C204%7C247&map=1&nflt=ht_id%3D204%3Bht_id%3D216%3B&no_rooms=1&percent_htype_hotel=1&postcard=0&raw_dest_type=region&room1=A&sb_price_type=total&search_selected=1&src=index&ss=Tirol%2C%20Austria&ss_all=0&ss_raw=tir&ssb=empty&sshis=0&rows=15&offset=15';
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
const enterText = require('../moduls/utils.js').enterText;
const clickBtn = require('../moduls/utils.js').clickBtn;
const changeInnerText = require('../moduls/utils.js').changeInnerText;
const getNextPageBtnObj = require('../moduls/utils.js').getNextPageBtnObj;

// In pupeteer most methods are returning a promise
// so we need to wait on anything
async function createScrapingLogic() {
    try {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({Referer: 'https://workingatbooking.com/vacancies/'})
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36');
        await page.goto(gotoUrlB);
        console.log('1:')
        extractHotelCards(page, hotelsCardsObj)
        //await getToSearchResultspage(page);
        //await page.waitForSelector(closeMapLightboxSel);
      
        
        
       /* await clickBtn(page, closeMapLightboxSel);

        await clickBtn(page, radioBtns.hotels);
        await page.waitForSelector(`${radioBtns.hotels}${waitforSels.activeFilteClass}`);
        
        await clickBtn(page, radioBtns.guesthouse);
        await page.waitForSelector(`${radioBtns.guesthouse}${waitforSels.activeFilteClass}`);
       
        await page.waitForSelector(pagiBtnsObj.allsSel);
        await extractPaginatedPages(page, pagiBtnsObj, hotelsCardsObj, '1')*/
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
    await page.evaluate(function(pagiBtnsObj, hotelsCardsObj){
        extractHotelCards(page, hotelsCardsObj);
    }, ...[pagiBtnsObj, hotelsCardsObj])

    let nextPagiBtnObj =await getNextPageBtnObj(page, currPagiBtnInnerText, pagiBtnsObj);

    if (nextPagiBtnObj) {
        await page.goto(nextPagiBtnObj.nextHref)
        await page.waitForSelector(`${pagiBtnsObj.li}${pagiBtnsObj.activesSel}`);

        extractPaginatedPages(page, pagiBtnsObj, hotelsCardsObj, nextPagiBtnObj.innerText);
        
    } else {
        return 'all pages extracted'
    }     
}

/*
const hotelsCardsObj = {
    mainDivsSel : '[data-hotelid]',
    uniqueSel : 'data-hotelid',
    namesSel : 'span.sr-hotel__name',
    profPagesLinkSel : 'a.hotel_name_link.url'
};
*/
/*
    extract hotel carads
        all cards
        hotelsInfosObj
        loop through al card
            extract one card
                get name
                go to sub page
                get adress
                go back to prec page
                return name and adress
            push name and adreess into hotelinfos obj
        retunr hotelinfos obj

*/          

async function extractHotelCards(page, hotelsCardsObj){
    console.log('hotelsCardsObj:');
    console.log(hotelsCardsObj);
    let hotelinfos = {};
    let allHotelCardOnPage = await page.$$(hotelsCardsObj.mainDivsSel);

    for (let [i, hotelCard] of allHotelCardOnPage.entries()) {
        // statement
        try {
            console.log('for i: ' + i + '--------------------------');
            let hotelName = await hotelCard.$eval(hotelsCardsObj.namesSel, node => {
                console.log(node.innerText);
                return node.innerText;
            });

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
    
}

async function getAddressFromProfPage(hotelCard, hotelsCardsObj) {
    try {
        var browser = await puppeteer.launch({headless: true});
        var page = await browser.newPage();
        await page.setExtraHTTPHeaders({Referer: 'https://workingatbooking.com/vacancies/'})
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36');

        let profPageLink = await hotelCard.$eval(hotelsCardsObj.profPagesLinkSel, node => {
            console.log(node.href);
            return node.href;
        });

        await page.goto(profPageLink)
        await page.waitForSelector(hotelsCardsObj.addressSel);

        let hotelAddress = await page.$eval(hotelsCardsObj.addressSel, span => {
        console.log(span.innerText);    
        return span.innerText;
        });

        browser.close()

        return hotelAddress;
    } catch(e) {
        // statements
        console.log('getadrr ' + e);
    }
}

createScrapingLogic();
