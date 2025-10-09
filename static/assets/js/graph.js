Highcharts.chart('pie-chart', {
    chart: {
        type: 'pie',
        backgroundColor: '#ffffff'
    },
    title: {
        text: 'Development Status',
        align: 'left',
        style: {
            fontSize: '10px',
            color: '#333'
        }
    },
    tooltip: { enabled: false },
    legend: { enabled: false },
    credits: { enabled: false },
    plotOptions: {
        pie: {
            size: '180%',
            dataLabels: {
                enabled: true,
                format: '{point.name}: {point.y}%',
                style: {
                    color: '#333',
                    fontSize: '11px',
                    fontWeight: 'normal',
                    textOutline: 'none',
                    textShadow: 'none'
                }
            }
        }
    },
    series: [{
        colorByPoint: true,
        data: [
            { name: 'Completed', y: 60, color: '#59ff72ff' },
            { name: 'Pending', y: 40, color: '#5284f7ff' }
        ]
    }]
});


Highcharts.chart('bar-chart', { 
  chart: {
    type: 'column',
    backgroundColor: '#f8fafc',
    height: '40%',
    spacing: [0, 0, 0, 0],
    marginLeft: 10
  },
  title: {
    text: 'Land Parameters',
    align: 'left',
    style: {
      color: '#1e293b',
      fontSize: '14px',
      fontWeight: 'bold'
    }
  },
  xAxis: {
    categories: [
      'Possessed',
      'Unpossessed',
      'Purchased',
      'Possessed Not Purchased',
      'Hold',
      'Litigation'
    ],
    labels: { enabled: false }, 
    lineWidth: 0,
    tickLength: 0
  },
  yAxis: { visible: false },
  legend: { enabled: false },
  credits: { enabled: false },
  plotOptions: {
    column: {
      pointPadding: 0.1,
      groupPadding: 0.1,
      pointWidth: 40,
      borderRadius: 4,
      states: {
        hover: {
          brightness: -0.4 // stronger dark shade on hover
        }
      },
      dataLabels: {
        enabled: true,
        useHTML: true,
        inside: false,
        y: -18,
        style: {
          color: '#1e293b',
          fontSize: '10px',
          fontWeight: 'normal',
          textOutline: 'none',
          textShadow: 'none',
          whiteSpace: 'normal',
          textAlign: 'center'
        },
        formatter: function () {
          return `${this.point.name}:<br/>
                  <strong>${Highcharts.numberFormat(this.y, 0)}</strong><br/>
                  Kanals`;
        }
      }
    }
  },
  series: [{
    name: 'Count',
    data: [
      { name: 'Possessed', y: 225568, color: '#f99d5fff' },
      { name: 'Unpossessed', y: 90542, color: '#75f577ff' },
      { name: 'Purchased', y: 150000, color: '#25e17aff' },
      { name: 'Possessed Not Purchased', y: 301542, color: '#92a5f9ff' },
      { name: 'Hold', y: 200000, color: '#6cadeeff' },
      { name: 'Litigation', y: 130000, color: '#c95a5aff' }
    ],
    colorByPoint: true
  }]
})



