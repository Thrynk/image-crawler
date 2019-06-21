const Sitemapper = require('sitemapper');
const imgsUrlCrawler = require("./imgsUrl");
const request = require("request");

var sitemap = new Sitemapper();

var testImgStatus = function(imgUrl){
    imgUrl = imgUrl.replace("../", "");
    request(
        "https://decathlon.co.uk/" + imgUrl,
        {
            originalHostHeaderName: 'Host'
        },
        function (error, response, body) {
            if(!error){
                if (response && response.statusCode === 404) {
                    console.log("https://decathlon.co.uk/" + imgUrl);
                }
                else if(response && response.statusCode === 400){
                    console.log("Bad request : https://decathlon.co.uk/" + imgUrl);
                }
                else{
                    console.log("Image OK : https://decathlon.co.uk/" + imgUrl);
                }
            }
            else {
                console.log(error);
            }
        }
    );
};

sitemap.fetch('https://www.decathlon.co.uk/content/sitemaps/NavigationSitemap.xml').then(function(sites) {
    /*sites.sites.forEach(function(site){*/
    for(let i = 0; i < 3; i++){
        console.log(i+1);
        imgsUrlCrawler(sites.sites[i]).then(function (imgUrls) {
            imgUrls.forEach(function (imgUrl) {
                setTimeout(function(){
                    testImgStatus(imgUrl);
                }, 1500);

            });
        });
    }
    /*});*/
});
