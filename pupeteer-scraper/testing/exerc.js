var majom1 = 'feri1';
var majom2 = 'feri2';
var majom3 = 'feri3';
var majom4 = 'feri';
var majom5 = 'feri';
var majom6 = 'feri';
var majom7 = 'feri';
var mami = require('./testing.js').mami;
var idiot = this;
mami.call(...globalsForMami());

console.log(...globalsForMami());

function globalsForMami(){
    return [majom2, majom3, majom4, majom5, majom6, majom7];
}

function loop(paramObj, index){
    let index = index || 0;
    let paramObjKeys = Object.keys(paramObj);
    let paramObjValues = Object.values(paramObj);
}