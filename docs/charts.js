"use strict";
// import Chart from 'chart.js/auto';
Object.defineProperty(exports, "__esModule", { value: true });
exports.bgColorPlugin = exports.bgImagePlugin = void 0;
// export const buildChartFromData = (canvasId: string, title:string, data:any, options:any) => {
//     const target = document.getElementById(canvasId) as HTMLCanvasElement;
//     if (!target) return false
//     var xValues = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
//     new Chart(target, {
//         type: "line",
//         data: {
//             labels: xValues,
//             datasets: [{
//                 data: [860, 1140, 1060, 1060, 1070, 1110, 1330, 2210, 7830, 2478],
//                 borderColor: "red",
//                 fill: false
//             }, {
//                 data: [1600, 1700, 1700, 1900, 2000, 2700, 4000, 5000, 6000, 7000],
//                 borderColor: "green",
//                 fill: false
//             }, {
//                 data: [300, 700, 2000, 5000, 6000, 4000, 2000, 1000, 200, 100],
//                 borderColor: "blue",
//                 fill: false
//             }]
//         },
//         options: {
//            // legend: { display: false }
//         }
//     });
//     return
// }
const pluginBgImage = new Image();
pluginBgImage.src = 'https://www.chartjs.org/img/chartjs-logo.svg';
exports.bgImagePlugin = {
    id: 'customCanvasBackgroundImage',
    beforeDraw: (chart) => {
        if (pluginBgImage.complete) {
            const ctx = chart.ctx;
            const { top, left, width, height } = chart.chartArea;
            const x = left + width / 2 - pluginBgImage.width / 2;
            const y = top + height / 2 - pluginBgImage.height / 2;
            ctx.drawImage(pluginBgImage, x, y);
        }
        else {
            pluginBgImage.onload = () => chart.draw();
        }
    }
};
exports.bgColorPlugin = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart, args, options) => {
        const { ctx } = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = options.color || '#99ffff';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};
