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

module.exports.enterText = enterText;
module.exports.changeInnerText = changeInnerText;
module.exports.changeInputsValue = changeInputsValue;
module.exports.clickBtn = clickBtn;
module.exports.getNextPageBtnObj = getNextPageBtnObj;