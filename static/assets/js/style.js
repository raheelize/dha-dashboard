document.addEventListener("DOMContentLoaded", function () {
    const cityCards = document.querySelectorAll(".city-card");
    const chartsPanel = document.querySelector(".charts-panel");

    // Save original HTML to restore later
    const defaultChartsHTML = chartsPanel.innerHTML;

    cityCards.forEach(card => {
        card.addEventListener("click", function () {
            // If already showing 3 charts, reset to default
            if (chartsPanel.classList.contains("expanded-view")) {
                chartsPanel.innerHTML = defaultChartsHTML;
                chartsPanel.classList.remove("expanded-view");
                return;
            }

            // Otherwise, show 3 chart layout
            chartsPanel.classList.add("expanded-view");
            chartsPanel.innerHTML = `
               <div class="chart-column">
  <div id="pie-chart-1" class="chart-box"></div>
  <div id="pie-chart-2" class="chart-box"></div>
  <div id="pie-chart-3" class="chart-box"></div>
</div>
            `;

            // Re-initialize your Highcharts charts
            if (typeof Highcharts !== "undefined") {
                Highcharts.chart('pie-chart-1', {
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
                            size: '100%',
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
                Highcharts.chart('pie-chart-2', {
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
                            size: '100%',
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
                Highcharts.chart('pie-chart-3', {
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
                            size: '100%',
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
            }
        });
    });
});