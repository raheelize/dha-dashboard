// Initialize map
var map = L.map('map').setView([24.8120, 67.0650], 12); // Initial view

// Add Esri World Imagery (Satellite Layer)
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri'
}).addTo(map);

// DHA Phases across Pakistan
var dhaPhases = [
    { name: "DHA City", coords: [25.008, 67.4528] },
    { name: "DHA Karachi", coords: [24.7873, 67.0705] },
    { name: "DHA Lahore", coords: [31.47780, 74.40966] },
    { name: "DHA Gujranwala", coords: [32.27924, 74.13658] },
    { name: "DHA Bahawalpur", coords: [29.32569, 71.67619] },
    { name: "DHA Islamabad", coords: [33.5395, 73.0986] },
    { name: "DHA Multan", coords: [30.2907, 71.51773] },
    { name: "DHA Peshawar", coords: [34.05411, 71.43258] },
    { name: "DHA Quetta", coords: [30.3049, 66.9150] }
];

// Create LatLngBounds to fit all markers
var bounds = L.latLngBounds();

// Add custom SVG green markers with labels
dhaPhases.forEach(function (phase) {
    var markerHtml = `
        <div class="custom-marker">
            <div class="marker-label">${phase.name}</div>
            <svg width="25" height="40" viewBox="0 0 25 50" xmlns="http://www.w3.org/2000/svg">
                <path fill="#0CB680" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 37.5 12.5 37.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
                <circle cx="12.5" cy="12.5" r="5" fill="white"/>
            </svg>
        </div>
    `;

    var marker = L.marker(phase.coords, {
        icon: L.divIcon({
            html: markerHtml,
            className: '',
            iconSize: [25, 35],
            iconAnchor: [10, 50]
        })
    }).addTo(map);

    bounds.extend(phase.coords);
});

// Fit map to all markers
map.fitBounds(bounds, { padding: [40, 40] });

// Label styling
var style = document.createElement('style');
style.innerHTML = `
.custom-marker {
    position: relative;
    text-align: center;
}
.marker-label {
    position: absolute;
    bottom: 42px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.75);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: bold;
    color: #151715ff; /* dark green text */
    white-space: nowrap;
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
`;
document.head.appendChild(style);
