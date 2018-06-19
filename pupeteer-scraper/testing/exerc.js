const url = require('url');

let gugli = 'https://www.google.com/search?ei=EOwnW5zsD-HPgAbn0L7wBg&q=majom+itttas&oq=majom+itttas&gs_l=psy-ab.3..33i160k1.16492700.16494169.0.16495346.7.7.0.0.0.0.161.260.1j1.2.0....0...1c.1.64.psy-ab..5.2.259...0j0i10k1.0.wg3oPEkqetE'

let parsedUrl = url.parse(gugli, true);
console.log('parsedUrl:');
console.log(parsedUrl);
// Get the path

let queryStringObj = parsedUrl.query;
console.log('queryStringObj:');
console.log(queryStringObj);