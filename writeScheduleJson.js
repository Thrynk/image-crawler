let schedule = new Array();
let dayStart = 1;
let hourStart = 0;
let minutesStart = 5;
for(let i = 0; i < 1110; i+=2){
    schedule.push({
        rangeStart: i,
        rangeEnd: i+2,
        between: {
            dayStart: dayStart,
            hourStart: hourStart
        }
    });

    minutesStart += 10;
    if(minutesStart > 60){
        hourStart += 1;
        minutesStart = 0;
    }

    if(hourStart === 25){
        dayStart +=1;
        hourStart = 0;
    }
}
console.log(schedule);

let scheduleObject = {
    schedule : schedule
}
const fs = require("fs");
fs.writeFile("schedule.json", JSON.stringify(scheduleObject), function(err){
   if(err) throw error;
   console.log("File saved");
});
