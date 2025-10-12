// Highcharts.chart('pie-chart', {
//   chart: {
//     type: 'pie',
//     backgroundColor: 'transparent'
//   },
//   title: { text: null },
//   tooltip: { enabled: false },
//   legend: {
//     enabled: true,
//     layout: 'vertical',
//     align: 'right',
//     verticalAlign: 'middle',
//     itemStyle: {
//       color: '#333',
//       fontSize: '11px',
//       fontWeight: 'normal'
//     },
//     symbolRadius: 0,
//     symbolHeight: 10,
//     symbolWidth: 10,
//     padding: 0,
//     itemMarginTop: 4,
//     itemMarginBottom: 4
//   },
//   credits: { enabled: false },
//   plotOptions: {
//     pie: {
//       size: '100%',
//       center: ['40%', '50%'], // keep chart centered with legend
//       dataLabels: {
//         enabled: true,
//         format: '{point.name}: {point.y}%',
//         style: {
//           color: '#333',
//           fontSize: '11px',
//           fontWeight: 'normal',
//           textOutline: 'none'
//         }
//       }
//     }
//   },
//   series: [{
//     colorByPoint: true,
//     data: [
//       { name: 'Owner Type A', y: 25, color: '#59ff72ff' },
//       { name: 'Owner Type B', y: 20, color: '#5284f7ff' },
//       { name: 'Owner Type C', y: 15, color: '#999be1ff' },
//       { name: 'Owner Type D', y: 25, color: '#f99d5fff' },
//       { name: 'Owner Type E', y: 15, color: '#6cadeeff' }
//     ]
//   }]
// });



// Highcharts.chart('bar-chart', {
//   chart: {
//     type: 'column',
//     backgroundColor: 'transparent',
//     height: '66%',
//     spacing: [0, 0, 0, 0],
//     marginLeft: 2
//   },
//  title: { text: null },
//   xAxis: {
//     categories: [
//       'Possessed',
//       'Unpossessed',
//       'Purchased',
//       'Possessed Not Purchased',
//       'Hold',
//       'Litigation'
//     ],
//     title: { text: 'Land Categories' },
//     labels: { enabled: false },
//     lineWidth: 0,
//     tickLength: 0
//   },
//     yAxis: {
//     title: { text: 'Kanals' },
//     labels: {
//       style: { fontSize: '9px', color: '#333' }
//     },
//     gridLineColor: '#e2e8f0'
//   },
//   legend: { enabled: false },
//   credits: { enabled: false },
//   plotOptions: {
//     column: {
//       pointPadding: 0.7,
//       groupPadding: 0.05,
//       pointWidth: 40,
//       borderRadius: 4,
//       states: {
//         hover: {
//           brightness: -0.4 // stronger dark shade on hover
//         }
//       },
//       dataLabels: {
//         enabled: true,
//         useHTML: true,
//         inside: false,
//         y: -18,
//         style: {
//           color: '#3b3f46ff',
//           fontSize: '9px',
//           fontWeight: 'normal',
//           textOutline: 'none',
//           textShadow: 'none',
//           whiteSpace: 'normal',
//           textAlign: 'center'
//         },
//         formatter: function () {
//           return `${this.point.name}:<br/>
//                   <strong>${Highcharts.numberFormat(this.y, 0)}</strong><br/>
//                   Kanals`;
//         }
//       }
//     }
//   },
//   series: [{
//     name: 'Count',
//     data: [
//       { name: 'Possessed', y: 225568, color: '#f99d5fff' },
//       { name: 'Unpossessed', y: 190542, color: '#75f577ff' },
//       { name: 'Purchased', y: 190000, color: '#25e17aff' },
//       { name: 'PnP', y: 301542, color: '#92a5f9ff' },
//       { name: 'Hold', y: 200000, color: '#6cadeeff' },
//       { name: 'Litigation', y: 130000, color: '#c95a5aff' }
//     ],
//     colorByPoint: true
//   }]
// })



