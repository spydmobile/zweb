"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const toolslib_1 = require("./tools/toolslib");
const zod_1 = require("zod");
const Highcharts = __importStar(require("highcharts"));
const charts_1 = require("./charts");
//import Chart from 'chart.js/auto';
// date: number;
// nid: number;
// Name: string;
// Motion: number;
// Light: number;
// Battery: number;
// TempC: number;
// RH: number;
// Notes: string | number;
/**
 * Sanitize and encode all HTML in a user-submitted string
 * https://portswigger.net/web-security/cross-site-scripting/preventing
 * @param  {String} str  The user-submitted string
 * @return {String} str  The sanitized string
 */
var sanitizeHTML = function (str) {
    return str.replace(/[^\w. ]/gi, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
};
const unitStatus = zod_1.z.object({
    date: zod_1.z.number(),
    nid: zod_1.z.number(),
    Name: zod_1.z.string(),
    Motion: zod_1.z.number(),
    Light: zod_1.z.number(),
    Battery: zod_1.z.number(),
    TempC: zod_1.z.number(),
    RH: zod_1.z.number(),
    Notes: zod_1.z.string().or(zod_1.z.number()).optional(),
});
var data24;
const timezone = new Date().getTimezoneOffset();
Highcharts.setOptions({
    time: {
        timezoneOffset: 7 * 60
    }
});
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    }
    else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
function doBatt(level) {
    let newLevel = Math.round(level / 10);
    //    console.error("newLevel",newLevel);
    let mt = 10 - newLevel;
    // console.error("mt",mt);
    let foo = '';
    foo = foo.padStart(newLevel, '#');
    foo = foo.padEnd(10, '-');
    return foo;
}
function processData(data24) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        var interimStats = {};
        const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).valueOf();
        //  console.log("filtering", yesterday);
        let my24 = data24.filter(r => {
            if (r.date > yesterday)
                return true;
        });
        console.log("cleaning");
        let graph24 = my24.map(r => {
            r.ldate = new Date(r.date).toLocaleString();
            delete r.Light;
            delete r.Battery;
            delete r.Motion;
            delete r.Notes;
            delete r.uuid;
            delete r._id;
            return r;
        });
        // remove duplicates
        console.log("removing dupes");
        // const uniqueArray = graph24.filter((value, index) => {
        //     const _value = JSON.stringify(value);
        //     console.log(".");
        //     return index === graph24.findIndex(obj => {
        //       return JSON.stringify(obj) === _value;
        //     });
        //   });
        const nidList = graph24.map(r => r.nid).filter((item, i, ar) => ar.indexOf(item) === i);
        const uniqueArray = graph24.filter((v, i, a) => a.findIndex(t => (t.TempC === v.TempC && t.RH === v.RH && t.ldate === v.ldate)) === i);
        for (const nid of nidList) {
            let current24 = yield uniqueArray.filter(r => r.nid == nid);
            let dataset = yield current24.sort(({ date: a }, { date: b }) => b - a);
            interimStats[nid] = dataset;
        }
        resolve(interimStats);
    }));
    // // sort by date
    // console.log("Sorting");
    // var res = uniqueArray.sort(({ date: a }, { date: b }) => b - a);
}
docReady(function () {
    // DOM is loaded and ready for manipulation here
    var finalStats;
    // handle the vox button click
    let voxButton = document.getElementById("vox-button");
    voxButton === null || voxButton === void 0 ? void 0 : voxButton.addEventListener("click", function () {
        console.log("vox button clicked");
        // us the web speech api to do voice recognition
        //@ts-ignore
        const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
        //@ts-ignore
        const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;
        //@ts-ignore
        const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
        const colors = ['aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', /* … */];
        const grammar = `#JSGF V1.0; grammar colors; public <color> = ${colors.join(' | ')};`;
        const recognition = new SpeechRecognition();
        const speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        const diagnostic = document.querySelector('.output');
        const bg = document.querySelector('html');
        const hints = document.querySelector('.hints');
        let colorHTML = '';
        colors.forEach((color, i) => {
            console.log(color, i);
            colorHTML += `<span style="background-color:${color};"> ${color} </span>`;
        });
        //@ts-ignore
        hints.innerHTML = `Tap or click then say a color to change the background color of the app. Try ${colorHTML}.`;
        recognition.start();
        console.log('Ready to receive a color command.');
        recognition.onresult = (event) => {
            const color = event.results[0][0].transcript;
            //@ts-ignore
            diagnostic.textContent = `Result received: ${color}.`;
            //@ts-ignore
            bg.style.backgroundColor = color;
            console.log(`Confidence: ${event.results[0][0].confidence}`);
        };
        recognition.onspeechend = () => {
            recognition.stop();
        };
        recognition.onnomatch = (event) => {
            //@ts-ignore
            diagnostic.textContent = "I didn't recognize that color.";
        };
        recognition.onerror = (event) => {
            //@ts-ignore
            diagnostic.textContent = `Error occurred in recognition: ${event.error}`;
        };
    });
    fetch("data24.json")
        .then(response => response.json())
        .then((raw) => __awaiter(this, void 0, void 0, function* () {
        finalStats = yield processData(raw);
        console.log("finalStats", finalStats);
    }))
        .then(() => {
        fetch("data.json")
            .then(response => response.json())
            .then(tentData => {
            // protect this incoming data from DOM xss
            let buildDate = tentData.build;
            let data = tentData.data;
            console.log("tentdata", tentData);
            const buildSpan = document.getElementById("buildSpan");
            const pageSpan = document.getElementById("pageSpan");
            if (pageSpan !== null)
                pageSpan.innerHTML = 'Page: ' + new Date().toLocaleString();
            if (buildSpan !== null)
                buildSpan.innerHTML = 'Build: ' + buildDate;
            const tentDisplay = document.getElementById("tentDisplay");
            if (tentDisplay !== null) {
                console.log("Doing tentDisplay");
                const list = document.createElement('ul');
                list.classList.add('w3-ul');
                for (const record of data) {
                    const name = (0, toolslib_1.tentSensorMap)(record.nid);
                    if (name !== false) {
                        const item = document.createElement('li');
                        //  item.classList.add('list-group-item')
                        const nameString = ` <div data-testid="${name.replace(' ', '-')}"><h5 class="w3-left-align">TENT:${name}</h5>`;
                        const battString = `<span title="Battery Level" class="little-padding w3-round-large w3-small w3-grey ">&nbsp; ${String(record.Battery).padStart(3, '0')}% &nbsp;</span>`;
                        const tempString = `<span title="Temp Celcius" class="little-padding w3-round-large w3-small w3-red">&nbsp; ${Math.round(record.TempC)} &nbsp;</span>`;
                        const rhString = `<span title="Relative Humidity Percent" class="little-padding w3-round-large w3-small w3-light-blue">&nbsp; ${String(Math.round(record.RH)).padStart(2, '0')} &nbsp;</span>`;
                        const nidString = `<span title="Node ID" class="little-padding w3-round-large w3-small w3-black ">&nbsp; ${String(record.nid).padStart(2, '0')} &nbsp;</span>`;
                        const agoString = `<span data-testid="ago-string" class="little-padding w3-round-large w3-small w3-orange " title="${new Date(record.date).toLocaleString()}">&nbsp; ${String(Math.round((Date.now() - record.date) / 1000 / 60)) + " Mins"} &nbsp;</span>`;
                        const notesString = `<small><br>${record.Notes}</small></div>`;
                        // const statsString = `<span class="statsTrigger" id="stats${record.nid}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-activity" viewBox="0 0 16 16">
                        //                 <path fill-rule="evenodd" d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2Z"/>
                        //               </svg></span>`
                        const statsStringOld = `<button type="button" id="stats${record.nid}" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#staticBackdrop${record.nid}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-activity" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2Z"/>
              </svg></button>
                </span>`;
                        const statsString = `<div onclick="document.getElementById('staticBackdrop${record.nid}').style.display='block';const newEvent = new Event('goStats'); ;document.getElementById('staticBackdrop${record.nid}').dispatchEvent(newEvent) " class="w3-button w3-blue w3-round-large w3-tiny shadow"><i class="w3-large fa fa-line-chart"></i></div>`;
                        const modalString = `
                <div class="w3-modal  stats" id="staticBackdrop${record.nid}"  foo="staticBackdropLabel${record.nid}" aria-hidden="true">

        
                  <div class="w3-modal-content w3-round-large">
                    <div class="modal-header">
                    <span onclick="document.getElementById('staticBackdrop${record.nid}').style.display='none'" 
        class="w3-button w3-display-topright w3-round-large w3-hover-red"><b>&times;</b></span>
                      <h5 class="modal-title" id="staticBackdropLabel${record.nid}">${name}</h5>
                      <button onclick="document.getElementById('staticBackdrop${record.nid}').style.display='block'" type="button" class="w3-button" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      ...
                    </div>
                    <div class="modal-footer">
                      <!--<button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>-->
              
                    </div>
                  </div>
            
              </div>`;
                        // console.log(record.Battery,battString);
                        item.innerHTML = `${nameString} ${battString} ${tempString} ${rhString} ${nidString} ${agoString} ${statsString} ${modalString} ${notesString} `;
                        list.appendChild(item);
                    }
                }
                tentDisplay.innerHTML = '';
                tentDisplay.appendChild(list);
            }
            const houseDisplay = document.getElementById("houseDisplay");
            if (houseDisplay !== null) {
                console.log("Doing houseDisplay");
                const list = document.createElement('ul');
                list.classList.add('w3-ul');
                for (const record of data) {
                    const name = (0, toolslib_1.houseSensorMap)(record.nid);
                    if (name !== false) {
                        const item = document.createElement('li');
                        //  item.classList.add('list-group-item')
                        const nameString = ` <div data-testid="${name.replace(' ', '-')}"><h5 class="w3-left-align">HOUSE:${name}</h5>`;
                        const battString = `<span title="Battery Level" class="little-padding w3-round-large w3-small w3-grey ">&nbsp; ${String(record.Battery).padStart(3, '0')}% &nbsp;</span>`;
                        const tempString = `<span data-testid="temp-string" title="Temp Celcius" class="little-padding w3-round-large w3-small w3-red">&nbsp; ${Math.round(record.TempC)} &nbsp;</span>`;
                        const rhString = `<span title="Relative Humidity Percent" class="little-padding w3-round-large w3-small w3-light-blue">&nbsp; ${String(Math.round(record.RH)).padStart(2, '0')} &nbsp;</span>`;
                        const nidString = `<span title="Node ID" class="little-padding w3-round-large w3-small w3-black ">&nbsp; ${String(record.nid).padStart(2, '0')} &nbsp;</span>`;
                        const agoString = `<span  data-testid="ago-string" class="little-padding w3-round-large w3-small w3-orange " title="${new Date(record.date).toLocaleString()}">&nbsp; ${String(Math.round((Date.now() - record.date) / 1000 / 60)) + " Mins"} &nbsp;</span>`;
                        const notesString = `<small><br>${record.Notes}</small></div>`;
                        // const statsString = `<span class="statsTrigger" id="stats${record.nid}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-activity" viewBox="0 0 16 16">
                        //                 <path fill-rule="evenodd" d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2Z"/>
                        //               </svg></span>`
                        const statsStringOld = `<button type="button" id="stats${record.nid}" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#staticBackdrop${record.nid}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-activity" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2Z"/>
              </svg></button>
                </span>`;
                        const statsString = `<div onclick="document.getElementById('staticBackdrop${record.nid}').style.display='block';const newEvent = new Event('goStats'); ;document.getElementById('staticBackdrop${record.nid}').dispatchEvent(newEvent) " class="w3-button w3-blue w3-round-large w3-tiny shadow"><i class="w3-large fa fa-line-chart"></i></div>`;
                        const modalString = `
                <div class="w3-modal  stats" id="staticBackdrop${record.nid}"  foo="staticBackdropLabel${record.nid}" aria-hidden="true">

        
                  <div class="w3-modal-content w3-round-large">
                    <div class="modal-header">
                    <span onclick="document.getElementById('staticBackdrop${record.nid}').style.display='none'" 
        class="w3-button w3-display-topright w3-round-large w3-hover-red"><b>&times;</b></span>
                      <h5 class="modal-title" id="staticBackdropLabel${record.nid}">${name}</h5>
                      <button onclick="document.getElementById('staticBackdrop${record.nid}').style.display='block'" type="button" class="w3-button" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      ...
                    </div>
                    <div class="modal-footer">
                      <!--<button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>-->
              
                    </div>
                  </div>
            
              </div>`;
                        // console.log(record.Battery,battString);
                        item.innerHTML = `${nameString} ${battString} ${tempString} ${rhString} ${nidString} ${agoString} ${statsString} ${modalString} ${notesString} `;
                        list.appendChild(item);
                    }
                }
                houseDisplay.innerHTML = '';
                houseDisplay.appendChild(list);
            }
            // here we will set things up for the house display.
            // we will need to get the house sensors and then get the data for them.
            // here we will extract data for tomatoes and build the tomato display
            const tomatoData = data.filter((record) => record.nid === 11)[0];
            tomatoData.Name = (0, toolslib_1.tentSensorMap)(tomatoData.nid);
            console.log("finalStats", finalStats);
            const tomatoStats = finalStats[tomatoData.nid];
            tomatoStats.sort((a, b) => a.date - b.date);
            console.debug({ tomatoData, tomatoStats });
            const woodThermostatData = data.filter((record) => record.nid === 5)[0];
            woodThermostatData.Name = (0, toolslib_1.tentSensorMap)(woodThermostatData.nid);
            const woodPlenumData = data.filter((record) => record.nid === 7)[0];
            woodPlenumData.Name = (0, toolslib_1.tentSensorMap)(woodPlenumData.nid);
            const woodThermostatStats = finalStats[woodThermostatData.nid];
            woodThermostatStats.sort((a, b) => a.date - b.date);
            const woodPlenumStats = finalStats[woodPlenumData.nid];
            woodPlenumStats.sort((a, b) => a.date - b.date);
            console.debug({ woodThermostatData, woodPlenumData, woodThermostatStats, woodPlenumStats });
            let tomatoDisplay = document.getElementById('tomatoDisplay');
            let homeDisplay = document.getElementById('homeDisplay');
            if (tomatoDisplay && homeDisplay) {
                const houseTomatoTemp = document.getElementById('garden-tent-temp');
                if (houseTomatoTemp)
                    houseTomatoTemp.innerText = tomatoData.TempC + "C";
                const gardenTitle = `Garden ${tomatoData.TempC + "C"}`;
                const houseTomatoChart = document.getElementById('garden-tent-chart');
                buildChartFromData('garden-tent-chart', gardenTitle, tomatoStats, {});
                const houseWoodThermostatValue = document.getElementById('house-wood-thermostat-value');
                if (houseWoodThermostatValue)
                    houseWoodThermostatValue.innerText = woodThermostatData.TempC + "C";
                const houseWoodThermostatChart = document.getElementById('wood-thermostat-chart');
                buildChartFromData('wood-thermostat-chart', 'Temperature', woodThermostatStats, {});
                const houseWoodPlenumTemp = document.getElementById('house-wood-plenum-temp');
                if (houseWoodPlenumTemp)
                    houseWoodPlenumTemp.innerText = woodPlenumData.TempC + "C";
                const houseWoodPlenumChart = document.getElementById('wood-plenum-chart');
                buildChartFromData('wood-plenum-chart', 'Temperature', woodPlenumStats, {});
                const tomatoTitle = document.createElement('h4');
                tomatoTitle.innerHTML = `${tomatoData.Name}`;
                tomatoDisplay.appendChild(tomatoTitle);
                const rhBlock = document.createElement('div');
                const rhTitle = document.createElement('h5');
                rhTitle.innerHTML = 'Relative Humidity:' + `${String(Math.round(tomatoData.RH)).padStart(2, '0')}% WARNING: If below 40% You may need to add Nutrients to the tank `;
                rhBlock.appendChild(rhTitle);
                tomatoDisplay.appendChild(rhBlock);
                const item = document.createElement('li');
                item.classList.add('list-group-item');
                const nameString = ` <h5 class="little-padding w3-left-align">HOUSE:${tomatoData.Name}</h5>`;
                const battString = `<span title="Battery Level" class="little-padding w3-round-large w3-small w3-grey ">&nbsp; ${String(tomatoData.Battery).padStart(3, '0')}% &nbsp;</span>`;
                const tempString = `<span title="Temp Celcius" class="little-padding w3-round-large w3-small w3-red">&nbsp; ${Math.round(tomatoData.TempC)} &nbsp;</span>`;
                const rhString = `<span title="Relative Humidity Percent" class="little-padding w3-round-large w3-small w3-light-blue">&nbsp; ${String(Math.round(tomatoData.RH)).padStart(2, '0')} &nbsp;</span>`;
            }
            return;
        })
            .then(() => {
            // process data:
            // add event handlers
            console.log("Adding modal handlers");
            const modals = document.querySelectorAll('.stats');
            console.log("modals:", modals);
            modals.forEach(element => {
                //  console.log("Adding event listener to modal", element);
                element.addEventListener('show.bs.modal', function (event) {
                    // Button that triggered the modal
                    var button = event.relatedTarget;
                    console.log("Showing modal", button);
                    // Extract info from data-bs-* attributes
                    // If necessary, you could initiate an AJAX request here
                    // and then do the updating in a callback.
                    //
                    // Update the modal's content.
                    var modalBodyInput = element.querySelector('.modal-body');
                    //get the id
                    let nid = event.relatedTarget.id.split('stats')[1];
                    const modal = document.getElementById(`staticBackdrop${nid}`);
                    console.log('nid', nid);
                    // filter the stats
                    console.log(finalStats[nid]);
                    // render a graph
                    const chartHolder = document.createElement('div');
                    chartHolder.id = "chart" + nid;
                    if (modalBodyInput !== null) {
                        modalBodyInput.innerHTML = '';
                        modalBodyInput.appendChild(chartHolder);
                    }
                    const res = finalStats[nid];
                    var chartName = `Last 24 Hours: ${res[0].Name}`;
                    var tempData = res.map((r) => { return [r.date, r.TempC]; });
                    var humData = res.map((r) => { return [r.date, r.RH]; });
                    Highcharts.chart({
                        chart: {
                            renderTo: 'chart' + nid,
                            type: 'spline',
                            height: 200
                        },
                        title: {
                            text: '' //chartName
                        },
                        // subtitle: {
                        //     text: 'Irregular time data in Highcharts JS'
                        // },
                        xAxis: {
                            type: 'datetime',
                            dateTimeLabelFormats: {
                                month: '%e. %b',
                                year: '%b'
                            },
                            // title: {
                            //     text: 'Date'
                            // }
                        },
                        yAxis: {
                            title: {
                                text: undefined
                            },
                            //   min: 10
                        },
                        tooltip: {
                            shared: true,
                            xDateFormat: '%H:%m',
                            headerFormat: '<b>{point.x:%b %e} {point.key}</b><br>',
                            pointFormat: '{series.name}: {point.y:.2f} <br>',
                            //  footerFormat: '<b>OK</b><br>',
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    enabled: true
                                }
                            }
                        },
                        colors: ['#6CF', '#39F', '#06C', '#036', '#000'],
                        // Define the data points. All series have a dummy year
                        // of 1970/71 in order to be compared on the same x axis. Note
                        // that in JavaScript, months start at 0 for January, 1 for February etc.
                        series: [{
                                type: 'spline',
                                name: "Temp",
                                tooltip: {
                                    valueSuffix: 'C',
                                },
                                data: tempData,
                                color: '#FF0000'
                            }, {
                                type: 'spline',
                                name: "RH",
                                tooltip: {
                                    valueSuffix: '%',
                                },
                                data: humData,
                                color: '#0000FF'
                            }],
                        responsive: {
                            rules: [{
                                    condition: {
                                        maxWidth: 200
                                    },
                                    chartOptions: {
                                        plotOptions: {
                                            series: {
                                                marker: {
                                                    radius: 2.5
                                                }
                                            }
                                        }
                                    }
                                }]
                        }
                    });
                });
                element.addEventListener('goStats', function (event) {
                    console.log("goStats event", event);
                    // get the nid
                    let nid = event.target.id.split('staticBackdrop')[1];
                    // Button that triggered the modal
                    var button = event.relatedTarget;
                    console.log("Showing modal", button);
                    // Extract info from data-bs-* attributes
                    // If necessary, you could initiate an AJAX request here
                    // and then do the updating in a callback.
                    //
                    // Update the modal's content.
                    //get the id
                    //  let nid = event.relatedTarget.id.split('stats')[1]
                    const modal = document.getElementById(`staticBackdrop${nid}`);
                    var modalBodyInput = modal.querySelector('.modal-body');
                    console.log('nid', nid);
                    // filter the stats
                    console.log(finalStats[nid]);
                    // render a graph
                    const chartHolder = document.createElement('div');
                    chartHolder.id = "chart" + nid;
                    if (modalBodyInput !== null) {
                        modalBodyInput.innerHTML = '';
                        modalBodyInput.appendChild(chartHolder);
                    }
                    const res = finalStats[nid];
                    var chartName = `Last 24 Hours: ${res[0].Name}`;
                    var tempData = res.map((r) => { return [r.date, r.TempC]; });
                    var humData = res.map((r) => { return [r.date, r.RH]; });
                    Highcharts.chart({
                        chart: {
                            renderTo: 'chart' + nid,
                            type: 'spline',
                            height: 200
                        },
                        title: {
                            text: '' //chartName
                        },
                        // subtitle: {
                        //     text: 'Irregular time data in Highcharts JS'
                        // },
                        xAxis: {
                            type: 'datetime',
                            dateTimeLabelFormats: {
                                month: '%e. %b',
                                year: '%b'
                            },
                            // title: {
                            //     text: 'Date'
                            // }
                        },
                        yAxis: {
                            title: {
                                text: undefined
                            },
                            //   min: 10
                        },
                        tooltip: {
                            shared: true,
                            xDateFormat: '%H:%m',
                            headerFormat: '<b>{point.x:%b %e} {point.key}</b><br>',
                            pointFormat: '{series.name}: {point.y:.2f} <br>',
                            //  footerFormat: '<b>OK</b><br>',
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    enabled: true
                                }
                            }
                        },
                        colors: ['#6CF', '#39F', '#06C', '#036', '#000'],
                        // Define the data points. All series have a dummy year
                        // of 1970/71 in order to be compared on the same x axis. Note
                        // that in JavaScript, months start at 0 for January, 1 for February etc.
                        series: [{
                                type: 'spline',
                                name: "Temp",
                                tooltip: {
                                    valueSuffix: 'C',
                                },
                                data: tempData,
                                color: '#FF0000'
                            }, {
                                type: 'spline',
                                name: "RH",
                                tooltip: {
                                    valueSuffix: '%',
                                },
                                data: humData,
                                color: '#0000FF'
                            }],
                        responsive: {
                            rules: [{
                                    condition: {
                                        maxWidth: 200
                                    },
                                    chartOptions: {
                                        plotOptions: {
                                            series: {
                                                marker: {
                                                    radius: 2.5
                                                }
                                            }
                                        }
                                    }
                                }]
                        }
                    });
                });
            });
            // accessing the elements with same classname
            const elements = document.querySelectorAll('.statsTrigger');
            // adding the event listener by looping
            elements.forEach(element => {
                console.log("Adding event listener", element);
                element.addEventListener('click', (e) => {
                    console.log("looking for nid", e);
                });
            });
        });
    });
});
const buildChartFromData = (canvasId, chartTitle, data, options) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("buildChartFromData", canvasId, chartTitle, data, options);
    const target = document.getElementById(canvasId);
    if (!target)
        return false;
    const ourLabels = [];
    const dsTemperature = {
        data: [],
        borderColor: "red",
        label: 'Temp C',
        fill: false
    };
    const dsHumidity = {
        data: [],
        borderColor: "blue",
        label: 'third values',
        fill: false
    };
    const ourDatasets = [dsTemperature, dsHumidity];
    // setup the data
    for (const dataNode of data) {
        const dataNodeDate = new Date(dataNode.date);
        ourLabels.push(dataNodeDate.toLocaleString().split(', ')[1]);
        dsTemperature.data.push(dataNode.TempC);
        dsHumidity.data.push(dataNode.RH);
    }
    const ourDatasetsOld = [{
            data: [860, 1140, 1060, 1060, 1070, 1110, 1330, 2210, 7830, 2478],
            borderColor: "red",
            label: 'First values',
            fill: false
        }, {
            data: [1600, 1700, 1700, 1900, 2000, 2700, 4000, 5000, 6000, 7000],
            borderColor: "green",
            label: 'second values',
            fill: false
        }, {
            data: [300, 700, 2000, 5000, 6000, 4000, 2000, 1000, 200, 100],
            borderColor: "blue",
            label: 'third values',
            fill: false
        }];
    const chartObject = {
        type: "line",
        data: {
            labels: ourLabels,
            datasets: ourDatasets
        },
        options: {
            plugins: {
                customCanvasBackgroundColor: {
                    color: '#1a1a1a',
                },
                title: {
                    display: false,
                    text: chartTitle,
                    color: 'white',
                    font: {
                        size: 24
                    }
                }
            },
            scales: {
                x: {
                    border: {
                        display: true
                    },
                    grid: {
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: true,
                        color: 'white'
                    }
                },
                y: {
                    border: {
                        display: false
                    },
                    grid: {
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: true,
                        color: 'white'
                    },
                },
            }
        },
        plugins: [
            // bgImagePlugin,
            charts_1.bgColorPlugin
        ]
    };
    //@ts-ignore
    new Chart(target, chartObject);
    return;
});
