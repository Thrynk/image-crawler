const Sitemapper = require('sitemapper');
const imgsUrlCrawler = require("./imgsUrl");
const request = require("request");
const {google} = require('googleapis');
const fs = require("fs");
const path = require("path");

require("dotenv").config({path: path.resolve(__dirname, ".env")});

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
                    console.log(imgUrl);
                    reject({message: "Error request", error: error});
                }
            }
        );
    });

}

const _cliProgress = require('cli-progress');

// create a new progress bar instance and use shades_classic theme
const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
console.log(path.resolve(__dirname, "ExcelInfo.json"));
let ExcelInfo = JSON.parse(fs.readFileSync(path.resolve(__dirname, "ExcelInfo.json"), "utf8"));
console.log(ExcelInfo.lastSiteTreated);

/*let scheduleObj = JSON.parse(fs.readFileSync(path.resolve(__dirname, "schedule.json"), "utf8"));

let execution = scheduleObj.schedule.find(function(range){
    return range.rangeStart === ExcelInfo.lastSiteTreated;
});

let now = new Date();
console.log(now.getUTCDay());
if(now.getUTCDay() === execution.between.dayStart){*/
    /*if(now.getUTCHours() === execution.between.hourStart){
        console.log("go for it");
    }
    else {
        console.log("not the right hour");
        process.exit();
    }*/
/*}
else {
    console.log("not the right day");
    process.exit();
}*/

let brokenImgUrlLinksSiteWide = new Array();
var sitemap = new Sitemapper();

sitemap.fetch('https://www.decathlon.co.uk/content/sitemaps/NavigationSitemap.xml').then(async function (sites) {

    let k = ExcelInfo.lastSiteTreated;

    for(let i = 0; i < 2; i++) {
        let brokenImgUrlsLink = new Array();
        console.log(sites.sites[k+i]);
        if (sites.sites[k+i] && sites.sites[k+i].match(/decathlon\.co\.uk\//) !== null) {
            let imgUrls = await imgsUrlCrawler(sites.sites[k+i]).catch(function (error) {
                console.log("Error getting img urls");
                console.log(error);
            });
            // start the progress bar with a total value of 200 and start value of 0
            bar1.start(imgUrls.length, 0);
            for (let j = 0; j < imgUrls.length; j++) {
                if (imgUrls[j].match(/skins/) === null) {
                    let response = await testImgStatus(imgUrls[j]).catch(function (error) {
                        console.log(error.message);
                        console.log(error.error);
                    });

                    if (response.status === 404) {
                        brokenImgUrlsLink.push(response.message);
                    }
                }
                // update the current value in your application..
                bar1.update(j);
            }
            brokenImgUrlLinksSiteWide = brokenImgUrlLinksSiteWide.concat(brokenImgUrlsLink);
            // stop the progress bar
            bar1.stop();
        } else {
            console.log("Site Url invalid for request : " + sites.sites[k+i]);
        }
    }
    spreadSheetAPI.authorize(credentials, writeInSpreadsheet, brokenImgUrlLinksSiteWide);
    console.log(path.resolve(__dirname, "ExcelInfo.json"));
    if(ExcelInfo.lastSiteTreated === 1100) {
        fs.writeFile(path.resolve(__dirname, "ExcelInfo.json"), JSON.stringify({
            lastSiteTreated : 0
        }), function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("File ExcelInfo saved");
            }
        });

    }
    else{
        console.log(path.resolve(__dirname, "ExcelInfo.json"));
        fs.writeFileSync(path.resolve(__dirname, "ExcelInfo.json"), JSON.stringify({
            lastSiteTreated : ExcelInfo.lastSiteTreated + 2
        }));

    }



});

const spreadSheetAPI = require("./spreadsheetAPIAuth");

let credentials = require("./credentials");

let spreadsheetId = "1P02iuihmXmdm_obFkDe9bwgAOFwRTINV8M35NlhDcfk";

function writeInSpreadsheet(auth, brokenImgs) {
    console.log(brokenImgs);
    const sheets = google.sheets({version: 'v4', auth});
    /*sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A:A',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        console.log(rows);
    });*/

    let values = [];

    brokenImgs.forEach(function(imgUrl){
       values.push([imgUrl]);
    });

    sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A:A',
        valueInputOption: "RAW",
        resource: {
            values
        }
    }, (err, result) => {
        if (err) {
            // Handle error
            console.log(err);
        } else {
            console.log('cells updated.');
        }
    });
}
