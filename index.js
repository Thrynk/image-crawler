const Sitemapper = require('sitemapper');
const imgsUrlCrawler = require("./imgsUrl");
const request = require("request");

var sitemap = new Sitemapper();

function testImgStatus(imgUrl){
    return new Promise(function(resolve, reject){
        imgUrl = imgUrl.replace("../", "");
        request(
            "https://decathlon.co.uk/" + imgUrl,
            {
                originalHostHeaderName: 'Host'
            },
            function (error, response, body) {
                if(!error){
                    if (response && response.statusCode === 404) {
                        resolve({
                            message: "https://decathlon.co.uk/" + imgUrl,
                            status: 404
                        });
                    }
                    else if(response && response.statusCode === 400){
                        resolve({
                            message: "Bad request : https://decathlon.co.uk/" + imgUrl,
                            status: 400
                        });
                    }
                    else{
                        resolve({
                            message: "Image OK : https://decathlon.co.uk/" + imgUrl,
                            status: 200
                        });
                    }
                }
                else {
                    reject("Error request");
                }
            }
        );
    });

}

sitemap.fetch('https://www.decathlon.co.uk/content/sitemaps/NavigationSitemap.xml').then(function(sites) {
    /*sites.sites.forEach(function(site){*/
    for(let i = 0; i < 1; i++){
        imgsUrlCrawler(sites.sites[i]).then(async function (imgUrls) {
            for (let j = 0; j < imgUrls.length; j++) {
                if(imgUrls[j].match(/skins/) === null){
                    await testImgStatus(imgUrls[j]).then(function(response){
                        if(response.status === 404){
                            console.log(response.message);
                        }
                    }).catch(function(error){
                        console.log(error);
                    });
                }
            }
        });
    }
    /*});*/
});