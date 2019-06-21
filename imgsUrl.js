const request = require("request");
const cheerio = require("cheerio");

module.exports = function(url){
    return new Promise(function(resolve, reject){
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(body);

                let imgsArray = new Array();

                $('img[src]').each(function(index, element) {
                    imgsArray.push($(element).attr('src'));
                });

                $('img[data-src]').each(function(index, element) {
                    imgsArray.push($(element).attr('data-src'));
                });

                resolve(imgsArray);
            }
            else {
                if(error){
                    reject(error);
                }
                else {
                    reject(response.statusCode);
                }
            }
        });
    });
}