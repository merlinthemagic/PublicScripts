//automate entering squarespace tax for one state.


//use excel and notepad to create a list of all the zipcode could be 1000's
//+ tax (tax is excluding state tax) in the same format as below 
//and paste it in. NOTE: notice how the last line does not end in a ,
var data = [

	["96160","2.25"],
	["96161","2.25"],
	["96162","2.25"]
];

//next open the Square Space website in Chrome
//or Firefox. Go to -> settings, taxes.
//setup only a single state under the US and set a state tax.
//in california that is 6% currently. Then
//then hit F12 and the browser developer tools
//click on the console tab and paste this entire script
//hit enter. Now you should see the script working.

//Now the squarespace site is leaking memory so every 100 or
//so entries you will have to CLOSE the browser and start over.
//you can paste the entire script in again and it will pick up 
//form the last zip code it added.

var curZipcode 		= "";
var curRate			= "";
var loopReady		= true;
var failCount		= 0;
var maxFailCount	= 5;
var delayMs			= 0;
var maxDelayMs		= 10000;
var entriesMade		= 0;

function triggerMouseEvent(ele, eventType) {
    var cEvent = document.createEvent('MouseEvents');
    cEvent.initEvent(eventType, true, true);
    ele.dispatchEvent(cEvent);
}
function clickEle(ele) {
	triggerMouseEvent(ele, "mouseover");
	triggerMouseEvent(ele, "mousedown");
	triggerMouseEvent(ele, "click");
	triggerMouseEvent(ele, "mouseup");
	ele.blur();
}
function typeEle(ele, key) {
	
	var e = new Event("keydown");
	e.key=key;
	e.keyCode=e.key.charCodeAt(0); 
	e.which=e.keyCode; 
	e.altKey=false; 
	e.ctrlKey=true; 
	e.shiftKey=false; 
	e.metaKey=false; 
	e.bubbles=true; 
	ele.dispatchEvent(e);
	
	var e = new Event("keyup");
	e.key=key;
	e.keyCode=e.key.charCodeAt(0); 
	e.which=e.keyCode; 
	e.altKey=false; 
	e.ctrlKey=true; 
	e.shiftKey=false; 
	e.metaKey=false; 
	e.bubbles=true; 
	ele.dispatchEvent(e);
}

function getLocal()
{
	function contains(selector, text) {
		  var elements = document.querySelectorAll(selector);
		  return [].filter.call(elements, function(element){
		    return RegExp(text).test(element.textContent);
		  });
		}
	return contains('span', 'add local')[0];
}

function getSingle()
{
	return document.querySelector("div[data-test='MultiOption single']");
}
function fillZip()
{
	var zipEle		= document.querySelector("input[name='zipStart']");
	zipEle.focus();
	zipEle.setAttribute("value", curZipcode);
	zipEle.value 	= curZipcode;
	var zipChars	= curZipcode.split("");
	zipChars.forEach(function(aChar) {
		typeEle(zipEle, aChar);
	});
	zipEle.blur();
}
function fillRate()
{
	var rateEle	= document.querySelector("input[name='rate']");
	rateEle.focus();
	rateEle.setAttribute("value", curRate);
	rateEle.value 	= curRate;
	var rateChars	= curRate.split("");
	rateChars.forEach(function(aChar) {
		typeEle(rateEle, aChar);
	});
	rateEle.blur();
}
function getSave()
{
	return document.querySelector("input[data-test='dialog-saveAndClose']");
}
function getCancel()
{
	return document.querySelector("a[data-test='dialog-cancel']");
}
function processLoop()
{
	
	//get local add
	getLocal().click();
	
	setTimeout(function(){
		//get single zipcode form
		getSingle().click();
	}, 750);
	setTimeout(function(){
		//fill the zip
		fillZip();
	}, 1500);
	setTimeout(function(){
		//fill the rate
		fillRate();
	}, 2250);
	setTimeout(function(){
		//submit the form
		var rateEle	= document.querySelector("input[name='rate']");
		if (rateEle == null) {
			
			console.log("Fail: Rate Element missing");
			loopReady	= false;
			getCancel().click();
			
		} else {
			
			if (rateEle.value == curRate) {
				
				console.log("Success: " + curZipcode + ", " + curRate + ", delay: " + delayMs);
				loopReady	= true;
				
				//savenext loop
				getSave().click();
				
			} else {
				
				console.log("Fail. Rate should be: " + curRate + ", is: " + rateEle.value + ", delay: " + delayMs);
				
				loopReady	= false;
				getCancel().click();
			}
		}

		setTimeout(function(){
			triggerLoop();
		}, delayMs);

	}, 3000);
}

function triggerLoop()
{
	if (getSave() == null) {
		
		if (loopReady === true) {
			
			failCount	= 0;
			delayMs		-= 125;
			if (delayMs < 0) {
				delayMs	= 0;
			}
			
			var nextData	= getData().shift();
			if (typeof nextData == 'undefined') {
				//we are done
				finZipcode	= curZipcode;
				finRate		= curRate;
				
				curZipcode	= null;
				curRate		= null;
				
				alert("Finally DONE!: " + finZipcode + ", " + finRate);
				
			} else {
				entriesMade++;
				curZipcode		= String(nextData[0]);
				curRate			= String(nextData[1]);
				processLoop();
				
			}
			
		} else {
			
			//run same loop again, something went wrong
			processLoop();
		}

	} else {
		
		failCount++;
		delayMs		+= 500;
		if (delayMs > maxDelayMs) {
			delayMs	= maxDelayMs;
		}
		
		if (failCount >= maxFailCount) {
			
			console.log("Fail: " + failCount + " errors in a row, delay: " + delayMs + ", entries: " + entriesMade + ", resetting");
			loopReady	= false;
			failCount	= 0;
			delayMs		= 0;
			getCancel().click();
			
		} else {
			console.log("Cannot trigger save button still on page. Delay: " + delayMs);
		}
		setTimeout(function(){
			triggerLoop();
		}, delayMs);
	}
}
function getData()
{
	return data;
}

function syncArrayToLast()
{
	//many times we have to restart the process because the site is leaking data
	//the browser will end up consuming 10GB after 150 entries or so
	//this will remove the already done entries
	var taxRules = document.querySelectorAll("div[class='rule-body']");
	var lastRule	= taxRules[(taxRules.length - 1)];
	var taxZip  	= lastRule.querySelector("div[class='name']");
	var lastZip		= taxZip.textContent.trim();
	if(isNaN(lastZip) === false){
		var found		= false;
		data.forEach(function(zip, zId) {
			if (found === false) {
				if (zip[0] == lastZip) {
					found	= zId;
				}
			}
		});
		data	= data.slice((found + 1));
	}
}
syncArrayToLast();
triggerLoop();