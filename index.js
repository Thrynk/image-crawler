const Sitemapper = require('sitemapper');
const imgsUrlCrawler = require("./imgsUrl");
const request = require("request");
const {google} = require('googleapis');

var sitemap = new Sitemapper();

function testImgStatus(imgUrl){
    return new Promise(function(resolve, reject){
        imgUrl = imgUrl.replace("../", "");
        request(
            "https://decathlon.co.uk" + imgUrl,
            {
                originalHostHeaderName: 'Host'
            },
            function (error, response, body) {
                if(!error){
                    if (response && response.statusCode === 404) {
                        resolve({
                            message: "https://decathlon.co.uk" + imgUrl,
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
    let brokenImgUrls = new Array();
    for(let i = 33; i < 37; i++){
        imgsUrlCrawler(sites.sites[i]).then(async function (imgUrls) {
            for (let j = 0; j < imgUrls.length; j++) {
                if(imgUrls[j].match(/skins/) === null){
                    await testImgStatus(imgUrls[j]).then(function(response){
                        if(response.status === 404){
                            brokenImgUrls.push(response.message);
                        }
                    }).catch(function(error){
                        console.log(error);
                    });
                }
            }
            return brokenImgUrls;
        }).then(function(brokenImgUrls) {
            console.log(brokenImgUrls);
            console.log(brokenImgUrls.length);
        }).catch(function(error){
            console.log("Error getting img urls");
        });
    }
});

const spreadSheetAPI = require("./spreadsheetAPIAuth");

let credentials = require("./credentials");

let spreadsheetId = "1fAawZjTw4LmugGcL1kLpuqDJuLClUWPhYQdrpjf-b6E";

function writeInSpreadsheet(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.get({
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Class Data!A2:E',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            console.log('Name, Major:');
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row) => {
                console.log(`${row[0]}, ${row[4]}`);
            });
        } else {
            console.log('No data found.');
        }
    });
}

spreadSheetAPI.authorize(credentials, writeInSpreadsheet);