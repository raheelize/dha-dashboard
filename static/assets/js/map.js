// ==================== 🌍 MAP SETUP ====================

let map, currentWmsLayer = null;
let defaultView = {
    center: [31.5204, 74.3587],  // Lahore coords (example)
    zoom: 12
};




const DHA_PHASES = [
    { name: "DHA CITY", coords: [25.008, 67.4528], ip: window.IP_karachi_city },
    { name: "DHA K", coords: [24.7873, 67.0705], ip: window.IP_karachi },
    { name: "DHA L", coords: [31.47780, 74.40966], ip: window.IP_lahore },
    { name: "DHA G", coords: [32.27924, 74.13658], ip: window.IP_gujranwala },
    { name: "DHA B", coords: [29.32569, 71.67619], ip: window.IP_bahawalpur },
    { name: "DHA IR", coords: [33.5395, 73.0986], ip: window.IP_islamabad },
    { name: "DHA M", coords: [30.2907, 71.51773], ip: window.IP_multan },
    { name: "DHA P", coords: [34.05411, 71.43258], ip: window.IP_peshawar },
    { name: "DHA Q", coords: [30.3049, 66.9150], ip: window.IP_quetta }
];


// ==================== 🗺️ DEFAULT INIT ====================
function initMap() {
    map = L.map('map').setView(defaultView.center, defaultView.zoom);

    // Base Layer (Satellite)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri'
    }).addTo(map);

    // Add DHA markers
    const bounds = L.latLngBounds();

    DHA_PHASES.forEach(phase => {
        const markerHtml = `
            <div class="custom-marker">
                <div class="marker-label">${phase.name}</div>
                <svg width="25" height="40" viewBox="0 0 25 50">
                    <path fill="#0CB680" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 37.5 12.5 37.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
                    <circle cx="12.5" cy="12.5" r="5" fill="white"/>
                </svg>
            </div>
        `;

        L.marker(phase.coords, {
            icon: L.divIcon({
                html: markerHtml,
                className: '',
                iconSize: [25, 35],
                iconAnchor: [10, 50]
            })
        }).addTo(map);

        bounds.extend(phase.coords);
    });

    map.fitBounds(bounds, { padding: [40, 40] });

    // Marker label styling
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-marker { position: relative; text-align: center; }
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
            color: #151715;
            white-space: nowrap;
            box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
    `;
    document.head.appendChild(style);
}

function resetMap() {
    console.log('Resetting map to default view');
    // map = L.map('map').setView(defaultView.center, defaultView.zoom);

    if (map) {
        map.remove(); // completely removes all layers, events, and bindings
        map = null;
    }

    initMap();
}

function setMap(layer = "purchase_layer", category = null, station = "DHA G") {
    if (!map) {
        console.warn("⚠️ Map not initialized yet!");
        return;
    }

    console.log(`🗺️ Setting layer: ${layer}, category: ${category || "N/A"}, station: ${station}`);

    // Remove previous WMS layer if present
    if (currentWmsLayer) map.removeLayer(currentWmsLayer);

    // 💾 Layer Mapping (friendly names → actual GeoServer layers)
    const layerMap = {
        "purchase_layer": "dha_coregis:purchase_layer",
        "Residential": "dha_coregis_v2:Residential",
        "Commercial": "dha_coregis_v2:Commercial",
        "Education" : "dha_coregis_v2:Education",
        "Amenities" : "dha_coregis_v2:Amenities",
        "Parks": "dha_coregis_v2:Park and open Space",
        "Area_Kanals": "dha_coregis_v2:Horticulture Polygon",
        "Length_Km": "dha_coregis_v2:Horticulture Line",
        "Points": "dha_coregis_v2:Horticulture Point",
        "Check Post": "dha_coregis_v2:Check Post",
        "QRF" : "dha_coregis:qrf",
        "Picquet": "dha_coregis_v2:Picquet",
        "Camera" : "dha_coregis_v2:Camera",
        "Incidents" : "dha_coregis_v2:incidents",
        "Roads": "dha_coregis_v2:Roads",
        "Water Supply": "dha_coregis_v2:Water_Supply_Lines_Mains",
        "Electricity": "dha_coregis_v2:Electric_Lines_LT",
        "Gas Supply": "dha_coregis_v2:Gas_Network_Lines_Pipelines",
        "Sewerage": "dha_coregis:sewerage_line",
        "Drainage": "dha_coregis:strom_drains",
        "Commnnication": "dha_coregis:telcom_utility_line",
    };


    const ip = DHA_PHASES.find(
        p => p.name.toUpperCase() === station.toUpperCase()
    )?.ip;

    console.log("DHA IP", ip);


    // ⚙️ Auto-select GeoServer version & workspace
    const selectedLayer = layerMap[layer];
    const isV2 = selectedLayer?.includes("_v2:") ?? false;

    console.log("Selected Layer:", selectedLayer);
    const wmsBaseUrl = isV2
        ? `http://${ip}/geoserver/dha_coregis_v2/wms`
        : `http://${ip}/geoserver/dha_coregis/wms`;

    // 🧩 Determine final layer name
    const fullLayerName = layerMap[layer] || (isV2 ? `dha_coregis_v2:${layer}` : `dha_coregis:${layer}`);

    console.log("Base URL :", wmsBaseUrl);

    let cqlFilter = null;
    if (isV2 && category) {
        cqlFilter = `category='${category}'`;
    }

    const wmsOptions = {
        layers: fullLayerName,
        format: "image/png",
        transparent: true,
        version: isV2 ? "1.1.0" : "1.1.1",
        attribution: "GeoServer"
    };

    if (cqlFilter) wmsOptions.CQL_FILTER = cqlFilter;

    currentWmsLayer = L.tileLayer.wms(wmsBaseUrl, wmsOptions).addTo(map);


    const coords = DHA_PHASES.find(
        p => p.name.toUpperCase() === station.toUpperCase()
    )?.coords;

    if (!coords) {
        console.warn(`⚠️ Coordinates not found for '${station}'`);
        return;
    }


    currentWmsLayer.once("load", function () {
        console.log(`✅ ${layer} loaded — centering on ${station}`);

        map.invalidateSize();
        map.flyTo(coords, 12.5, {
            duration: 1.5,
            easeLinearity: 0.25,
            noMoveStart: true
        });

        // Re-center precisely after animation
        setTimeout(() => {
            map.panTo(coords, { animate: false });
        }, 1600);
    });
}

// ==================== 🚀 AUTO INIT ====================
initMap();
