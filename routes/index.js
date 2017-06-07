var express = require('express');
var router = express.Router();
var request = require('request'),   
	cachedRequest = require('cached-request')(request),
	cacheDirectory = "/tmp/cache";
var cheerio = require('cheerio');

router.get('/hours', function(req, res) {
	console.log("called");
	getHours(function(data) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		res.json(data);
	});
});

router.get('/hours/:id', function(req, res) {
	var id = req.params.id;
	getHours(function(data) {
		var lib;f
		for (var i = 0; i < data.length; i++) {
			if (data[i].id == id) {
				lib = data[i];
			}
		};
		res.send(lib);
	});
});


function getTime(time) {
	var ret = {};
	if (time == "closed") {
		ret.open = "closed";
		ret.close = "closed";
	}
	else if (time == "24 hours") {
		ret.open = "12:01 AM";
		ret.close = "11:59 PM";
	}
	else {
		var timearray = time.split('-');
		var opentime = timearray[0];
		var closetime = timearray[1];
		var o;
		var c;
		if (opentime.split(":").length === 1) {
			var len = opentime.length;
			var div = opentime[len-1];
			if (div === 'a') {
				div = ' AM'
			}
			else {
				div = ' PM'
			}
			o = opentime.slice(0, len-1) + ":00" + div;
		}
		else {
			var len = opentime.length;
			var div = opentime[len-1];
			if (div === 'a') {
				div = ' AM'
			}
			else {
				div = ' PM'
			}
			o = opentime.slice(0, len-1) + div
		}
		if (closetime.split(":").length === 1) {
			var len = closetime.length;
			var div = closetime[len-1];
			if (div === 'a') {
				div = ' AM'
			}
			else {
				div = ' PM'
			}
			c = closetime.slice(0, len-1) + ":00" + div
		}
		else {
			var len = closetime.length;
			var div = closetime[len-1];
			if (div === 'a') {
				div = ' AM'
			}
			else {
				div = ' PM'
			}
			c = closetime.slice(0, len-1) + div
		}
		ret.open = o;
		ret.close = c;
	}
	return ret;
}

function getHours(callback) {
	var url = 'https://www.library.ucla.edu/hours';
	var options = {
	    url: "https://www.library.ucla.edu/hours",
	    ttl: 86400 //1 day 
	 };
	cachedRequest(options, function(err, resp, body) {
		$ = cheerio.load(body);
		var tables = $('.opening-hours-week');
		var libraries = [];
		for (var j = 0; j < tables.length; j++) {
			var tableInfo = tables[j].children;
			var tbody;
			for (var i = 0; i < tableInfo.length; i++) {
				if (tableInfo[i].name == 'tbody') {
					tbody = tableInfo[i].children;
				}
			}
			var trs = [];
			for (var i = 0; i < tbody.length; i++) {
				if (tbody[i].name == 'tr') {
					trs.push(tbody[i].children)
				}
			};

			var libraryData = trs[0];

			var library = [];

			for (var i = 0; i < libraryData.length; i++) {
				if (libraryData[i].name == 'td') {
					library.push(libraryData[i].children[0]);
				}
			};
			libraries.push(library);
		}
		var finalData = [];
		for (var i = 0; i < libraries.length; i++) {
			var libraryInfo = {};
			if (libraries[i][1]) {
				libraryInfo["monday"] = getTime(libraries[i][1].data);
			}
			else {
				libraryInfo["monday"] = "NA";
			}
			if (libraries[i][2]) {
				libraryInfo["tuesday"] = getTime(libraries[i][2].data);
			}
			else {
				libraryInfo["tuesday"] = "NA";
			}
			if (libraries[i][3]) {
				libraryInfo["wednesday"] = getTime(libraries[i][3].data);
			}
			else {
				libraryInfo["wednesday"] = "NA";
			}
			if (libraries[i][4]) {
				libraryInfo["thursday"] = getTime(libraries[i][4].data);
			}
			else {
				libraryInfo["thursday"] = "NA";
			}
			if (libraries[i][5]) {
				libraryInfo["friday"] = getTime(libraries[i][5].data);
			}
			else {
				libraryInfo["friday"] = "NA";
			}
			if (libraries[i][6]) {
				libraryInfo["saturday"] = getTime(libraries[i][6].data);
			}
			else {
				libraryInfo["saturday"] = "NA";
			}
			if (libraries[i][7]) {
				libraryInfo["sunday"] = getTime(libraries[i][7].data);
			}
			else {
				libraryInfo["sunday"] = "NA";
			}
			finalData.push(libraryInfo);
		};
		finalData[0].name = "Arts Library";
		finalData[0].id = "5";
		finalData[0].geo = [34.074079, -118.439218];

		finalData[1].name = "Biomedical Library"
		finalData[1].id = "1";
		finalData[1].geo = [34.066639, -118.442408];

		finalData[2].name = "East Asian Library"
		finalData[2].id = "10";
		finalData[2].geo = [34.074759, -118.441832];

		finalData[3].name = "Law Library"
		finalData[3].id = "2";
		finalData[3].geo = [34.066639, -118.442408];

		finalData[4].name = "Library Special Collections"
		finalData[4].id = "3";
		finalData[4].geo = [34.066639, -118.442408];

		finalData[5].name = "Management Library"
		finalData[5].id = "14";
		finalData[5].geo = [34.07435, -118.443379];

		finalData[6].name = "Music Library"
		finalData[6].id = "16";
		finalData[6].geo = [34.07094, -118.440417];

		finalData[7].name = "Powell Library"
		finalData[7].id = "7";
		finalData[7].geo = [34.07162, -118.44218];

		finalData[8].name = "Research Library"
		finalData[8].id = "20";
		finalData[8].geo = [34.074954, -118.44165];

		finalData[9].name = "Science and Engineering Library"
		finalData[9].id = "25";
		finalData[9].geo = [34.068826, -118.442706];

		finalData[10].name = "Southern Regional Library Facility"
		finalData[10].id = "27";
		finalData[10].geo = [34.070864, -118.454188];

		
		var month = new Array();
		month[0] = "January";
		month[1] = "February";
		month[2] = "March";
		month[3] = "April";
		month[4] = "May";
		month[5] = "June";
		month[6] = "July";
		month[7] = "August";
		month[8] = "September";
		month[9] = "October";
		month[10] = "November";
		month[11] = "December";

		var revMonth = {
			"January": 1,
			"February": 2,
			"March": 3,
			"April": 4,
			"May": 5,
			"June": 6,
			"July": 7,
			"August": 8,
			"September": 9,
			"October": 10,
			"November": 11,
			"December": 12
		}

		function getDaysInMonth(monthNumber) {

			// jan
			if (monthNumber === 1) {
				return 31;
			}

			// feb
			if (monthNumber === 2) {
				return 28;
			}

			// march
			if (monthNumber === 3) {
				return 31;
			}

			// april
			if (monthNumber === 4) {
				return 30;
			}

			// may
			if (monthNumber === 5) {
				return 31;
			}

			// june
			if (monthNumber === 6) {
				return 30;
			}

			// july
			if (monthNumber === 7) {
				return 31;
			}

			// aug
			if (monthNumber === 8) {
				return 31;
			}

			// sep
			if (monthNumber === 9) {
				return 30;
			}

			// oct
			if (monthNumber === 10) {
				return 31;
			}

			// nov
			if (monthNumber === 11) {
				return 30;
			}

			// dec
			if (monthNumber === 12) {
				return 31;
			}

		}
		
		var tempDate = new Date();
		
		for (var i = 0; i < finalData.length; i++) {
			var curr = new Date();
			console.log(curr.getHours(), curr.getDay());
			
			tempDate = new Date();
			
			// monday
			tempDate = new Date();
			finalData[i].monday.month = month[new Date(tempDate.setDate(curr.getDate() - curr.getDay()+1)).getMonth()];

			finalData[i].monday.date = new Date(tempDate.setDate(curr.getDate() - curr.getDay()+1)).getDate();
			if ((curr.getHours() < 3 && curr.getDay() == 0) || curr.getDay() == 0) {
				if (finalData[i].monday.date <= 7) {
					finalData[i].monday.date += getDaysInMonth(revMonth[finalData[i].monday.month] - 1);
					finalData[i].monday.month = month[revMonth[finalData[i].monday.month] - 2];
				}
				finalData[i].monday.date -= 7;
			}

			// tuesday
			tempDate = new Date();
			finalData[i].tuesday.month = month[new Date(tempDate.setDate(curr.getDate() - curr.getDay()+2)).getMonth()];

			tempDate = new Date();
			finalData[i].tuesday.date = new Date(tempDate.setDate(curr.getDate() - curr.getDay()+2)).getDate();
			if ((curr.getHours() < 3 && curr.getDay() == 1) || curr.getDay() == 0) {
				if (finalData[i].tuesday.date <= 7) {
					finalData[i].tuesday.date += getDaysInMonth(revMonth[finalData[i].tuesday.month] - 1);
					finalData[i].tuesday.month = month[revMonth[finalData[i].tuesday.month] - 2];
				}
				finalData[i].tuesday.date -= 7;
			}

			// wednesday
			tempDate = new Date();
			finalData[i].wednesday.month = month[new Date(tempDate.setDate(curr.getDate() - curr.getDay()+3)).getMonth()];

			tempDate = new Date();
			finalData[i].wednesday.date = new Date(tempDate.setDate(curr.getDate() - curr.getDay()+3)).getDate();
			if ((curr.getHours() < 3 && curr.getDay() == 1) || curr.getDay() == 0) {
				if (finalData[i].wednesday.date <= 7) {
					finalData[i].wednesday.date += getDaysInMonth(revMonth[finalData[i].wednesday.month] - 1);
					finalData[i].wednesday.month = month[revMonth[finalData[i].wednesday.month] - 2];
				}
				finalData[i].wednesday.date -= 7;
			}
			
			// thursday
			tempDate = new Date();
			finalData[i].thursday.month = month[new Date(tempDate.setDate(curr.getDate() - curr.getDay()+4)).getMonth()];

			tempDate = new Date();
			finalData[i].thursday.date = new Date(tempDate.setDate(curr.getDate() - curr.getDay()+4)).getDate();
			if ((curr.getHours() < 3 && curr.getDay() == 1) || curr.getDay() == 0) {
				if (finalData[i].thursday.date <= 7) {
					finalData[i].thursday.date += getDaysInMonth(revMonth[finalData[i].thursday.month] - 1);
					finalData[i].thursday.month = month[revMonth[finalData[i].thursday.month] - 2];
				}
				finalData[i].thursday.date -= 7;
			}

			// friday
			tempDate = new Date();
			finalData[i].friday.month = month[new Date(tempDate.setDate(curr.getDate() - curr.getDay()+5)).getMonth()];

			tempDate = new Date();
			finalData[i].friday.date = new Date(tempDate.setDate(curr.getDate() - curr.getDay()+5)).getDate();
			if ((curr.getHours() < 3 && curr.getDay() == 1) || curr.getDay() == 0) {
				if (finalData[i].friday.date <= 7) {
					finalData[i].friday.date += getDaysInMonth(revMonth[finalData[i].friday.month] - 1);
					finalData[i].friday.month = month[revMonth[finalData[i].friday.month] - 2];
				}
				finalData[i].friday.date -= 7;
			}

			// saturday
			tempDate = new Date();
			finalData[i].saturday.month = month[new Date(tempDate.setDate(curr.getDate() - curr.getDay()+6)).getMonth()];

			tempDate = new Date();
			finalData[i].saturday.date = new Date(tempDate.setDate(curr.getDate() - curr.getDay()+6)).getDate();
			if ((curr.getHours() < 3 && curr.getDay() == 1) || curr.getDay() == 0) {
				if (finalData[i].saturday.date <= 7) {
					finalData[i].saturday.date += getDaysInMonth(revMonth[finalData[i].saturday.month] - 1);
					finalData[i].saturday.month = month[revMonth[finalData[i].saturday.month] - 2];
				}
				finalData[i].saturday.date -= 7;
			}
			
			// sunday
			tempDate = new Date();
			finalData[i].sunday.month = month[new Date(tempDate.setDate(curr.getDate() - curr.getDay()+7)).getMonth()];

			tempDate = new Date();
			finalData[i].sunday.date = new Date(tempDate.setDate(curr.getDate() - curr.getDay()+7)).getDate();
			if ((curr.getHours() < 3 && curr.getDay() == 1) || curr.getDay() == 0) {
				if (finalData[i].sunday.date <= 7) {
					finalData[i].sunday.date += getDaysInMonth(revMonth[finalData[i].sunday.month] - 1);
					finalData[i].sunday.month = month[revMonth[finalData[i].sunday.month] - 2];
				}
				finalData[i].sunday.date -= 7;
			}
		
		}
		
		// for laptops
		for (var i = 0; i < finalData.length; i++) {
			finalData[i].laptops = 0;
		}
		var lURL = 'https://webservices.library.ucla.edu/laptops/available';
		request(lURL, function(err, resp, body) {
			var laptopsData = JSON.parse(body).laptops;
			finalData[0].laptops = Number(laptopsData[0].availableCount);
			finalData[1].laptops = Number(laptopsData[1].availableCount);
			finalData[6].laptops = Number(laptopsData[2].availableCount);
			finalData[7].laptops = Number(laptopsData[3].availableCount);
			finalData[8].laptops = Number(laptopsData[4].availableCount);
			finalData[9].laptops = Number(laptopsData[5].availableCount) + Number(laptopsData[6].availableCount);
			return callback(finalData);
		});
	});
};

module.exports = router;
