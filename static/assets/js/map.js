// ==================== 🌍 MAP SETUP ====================

let map, currentWmsLayer = null;
let defaultView = {
    center: [31.5204, 74.3587],  // Lahore coords (example)
    zoom: 12
};




const DHA_PHASES = [
    { name: "DHA City", coords: [25.008, 67.4528], ip: window.IP_karachi_city , auth_key: window.KEY_karachi_city },
    { name: "DHA Karachi", coords: [24.7873, 67.0705], ip: window.IP_karachi , auth_key: window.KEY_karachi },
    { name: "DHA Lahore", coords: [31.47780, 74.40966], ip: window.IP_lahore , auth_key: window.KEY_lahore },
    { name: "DHA Gujranwala", coords: [32.27924, 74.13658], ip: window.IP_gujranwala , auth_key: window.KEY_gujranwala },
    { name: "DHA Bahawalpur", coords: [29.32569, 71.67619], ip: window.IP_bahawalpur , auth_key: window.KEY_bahawalpur },
    { name: "DHA Islamabad", coords: [33.5395, 73.0986], ip: window.IP_islamabad , auth_key: window.KEY_islamabad },
    { name: "DHA Multan", coords: [30.2907, 71.51773], ip: window.IP_multan , auth_key: window.KEY_multan },
    { name: "DHA Peshawar", coords: [34.05411, 71.43258], ip: window.IP_peshawar , auth_key: window.KEY_peshawar },
    { name: "DHA Quetta", coords: [30.3049, 66.9150], ip: window.IP_quetta , auth_key: window.KEY_quetta }
];


// 💾 Layer mapping
const layerMap = {
    'base_map' : 'dha_coregis:sat_image_low_res',
    "purchase_layer": "dha_coregis:purchase_layer",
    // Town Plan
    "Residential": "dha_coregis_v2:Residential",
    "Commercial": "dha_coregis_v2:Commercial",
    "Education": "dha_coregis_v2:Education",
    "Amenities": "dha_coregis_v2:Amenities",
    "Parks": "	dha_coregis_v2:Park and open Space",
    // Horticulture
    "Area_Kanals": "dha_coregis_v2:Horticulture Polygon",
    "Length_Km": "dha_coregis_v2:Horticulture Line",
    "Points": "dha_coregis_v2:Horticulture Point",
    // Security
    "Check Post": "dha_coregis_v2:Check Post",
    "QRF": "dha_coregis:QRF",
    "Picquet": "dha_coregis_v2:Picquet",
    "Camera": "dha_coregis_v2:Camera",
    "Incidents": "dha_coregis_v2:Incidents",
    // Cheif Eng
    "Roads": "dha_coregis:roads",
    // "Water Supply": "dha_coregis_v2:Water_Supply_Lines_Mains,dha_coregis_v2:Water_Supply_Lines_HouseConnections,dha_coregis_v2:Water_Network_Water Pump Stations,dha_coregis_v2:Water_Supply_Source_BulkSupply,dha_coregis_v2:Water_Supply_Source_TubeWells,dha_coregis_v2:Water_Supply_Storage_SurfaceWaterTank,dha_coregis_v2:Water_Supply_Storage_UndergroundWaterTank",
    "Water Supply - Lines (Mains)": "dha_coregis_v2:Water_Supply_Lines_Mains",
    "Water Supply - Lines (House Connections)": "dha_coregis_v2:Water_Supply_Lines_HouseConnections",
    "Water Supply - Pump Stations": "dha_coregis_v2:Water_Network_Water Pump Stations",
    "Water Supply - Source (Bulk Supply)": "dha_coregis_v2:Water_Supply_Source_BulkSupply",
    "Water Supply - Source (Tube Wells)": "dha_coregis_v2:Water_Supply_Source_TubeWells",
    "Water Supply - Storage (Surface Water Tank)": "dha_coregis_v2:Water_Supply_Storage_SurfaceWaterTank",
    "Water Supply - Storage (Underground Water Tank)": "dha_coregis_v2:Water_Supply_Storage_UndergroundWaterTank",
    // "Electricity": "dha_coregis_v2:Electric_Lines_LT,dha_coregis_v2:Electric_Lines_HT,dha_coregis_v2:Electric_Lines_HouseConnections,dha_coregis_v2:Electric_Network_Controls_PMT HT,	dha_coregis_v2:Electric_Network_Controls_RMU,dha_coregis_v2:Electric_Network_Controls_Transformer,dha_coregis_v2:Electric_Network_Stations_Feeder,dha_coregis_v2:Electric_Network_Stations_GridStation",
    "Electricity - Lines (LT)": "dha_coregis_v2:Electric_Lines_LT",
    "Electricity - Lines (HT)": "dha_coregis_v2:Electric_Lines_HT",
    "Electricity - Lines (House Connections)": "dha_coregis_v2:Electric_Lines_HouseConnections",
    "Electricity - Controls (PMT HT)": "dha_coregis_v2:Electric_Network_Controls_PMT HT",
    "Electricity - Controls (RMU)": "dha_coregis_v2:Electric_Network_Controls_RMU",
    "Electricity - Controls (Transformer)": "dha_coregis_v2:Electric_Network_Controls_Transformer",
    "Electricity - Stations (Feeder)": "dha_coregis_v2:Electric_Network_Stations_Feeder",
    "Electricity - Stations (Grid Station)": "dha_coregis_v2:Electric_Network_Stations_GridStation",

    "Gas Supply": "dha_coregis_v2:Gas_Network_Lines_Pipelines",
    "Sewerage": "dha_coregis:sewerage_line",
    // "Drainage": "dha_coregis:storm_drains",
    "Drains Closed":"dha_coregis_v2:Drainage_Network_Drains_Closed",
    "Drains Nullah":"dha_coregis_v2:Drainage_Network_Drains_Nullah",
    "Drains Open":"dha_coregis_v2:Drainage_Network_Drains_Open",
    "Gutter":"dha_coregis_v2:Drainage_Network_Gutter",
    "Communication": "dha_coregis:telecom_Utility_Line",
};


// ==================== 🗺️ DEFAULT INIT ====================

function initMap() {
    map = L.map('map').setView(defaultView.center, defaultView.zoom);

    // // Base Layer (Satellite)
    // L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    //     attribution: 'Tiles © Esri'
    // }).addTo(map);


    let station = 'DHA Karachi';
    const ip = DHA_PHASES.find(
        p => p.name.toUpperCase() === station.toUpperCase()
    )?.ip;

    const auth_key = DHA_PHASES.find(
        p => p.name.toUpperCase() === station.toUpperCase()
    )?.auth_key;


    L.tileLayer.wms(`http://${ip}/geoserver/dha_coregis/wms?auth_key=${auth_key}`, {
        layers: 'dha_coregis:sat_image_low_res',
        format: 'image/png',
        transparent: false,
        maxZoom: 24
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

function setMap(layer = "purchase_layer", category = null, station = "DHA Gujranwala") {
    if (!map) {
        console.warn("⚠️ Map not initialized yet!");
        return;
    }

    console.log(`🗺️ Setting layer: ${layer}, category: ${category || "N/A"}, station: ${station}`);

    // 🔄 Remove previous WMS layer if any
    if (currentWmsLayer) {
        map.removeLayer(currentWmsLayer);
        currentWmsLayer = null;
    }

    

    const stationData = DHA_PHASES.find(
        p => p.name.toUpperCase() == station.toUpperCase()
    );

    if (!stationData) {
        console.error(`❌ Station '${station}' not found in DHA_PHASES`);
        return;
    }

    const { ip, auth_key, coords } = stationData;

    console.log("🌐 Using GeoServer IP:", ip);

    // 🔍 Determine workspace and version
    const selectedLayer = layerMap[layer];
    if (!selectedLayer) {
        console.warn(`⚠️ Layer '${layer}' not found in map, skipping.`);
        return;
    }

    const isV2 = selectedLayer.includes("v2:");
    const workspace = isV2 ? "dha_coregis_v2" : "dha_coregis";

    const wmsBaseUrl = `http://${ip}/geoserver/${workspace}/wms?auth_key=${auth_key}`;
    console.log("Base URL:", wmsBaseUrl);

    // 🧩 CQL filter if applicable
    let wmsOptions = {
        layers: selectedLayer,
        format: "image/png",
        transparent: true,
        version: "1.1.0",
        attribution: "GeoServer",
    };

    if (category) {
        wmsOptions.CQL_FILTER = `category='${category}'`;
    }

    // 🛰️ Add the WMS layer dynamically
    currentWmsLayer = L.tileLayer.wms(wmsBaseUrl, wmsOptions).addTo(map);

    currentWmsLayer.once("load", function () {
        console.log(`✅ Layer '${layer}' loaded successfully — centering on ${station}`);

        map.invalidateSize();
        if (coords) {
            map.flyTo(coords, 12.5, {
                duration: 1.5,
                easeLinearity: 0.25,
                noMoveStart: true,
            });

            setTimeout(() => map.panTo(coords, { animate: false }), 1600);
        } else {
            console.warn(`⚠️ No coordinates found for ${station}`);
        }
    });
}



// Global dictionary to store active WMS layers
// 💾 Global trackers
let activeLayers = {'base_map' : 'dha_coregis:sat_image_low_res',   };                // your existing layers
let purchaseLayerCategories = [];     // active categories for purchase_layer

function toggleLayer(layerName, isChecked, station = null, category = null) {
    if (!map) {
        console.warn("⚠️ Map not initialized yet!");
        return;
    }

    // 🧭 Check selected station
    const selectedStation = document.querySelector('.city-card.selected h6')?.innerText;
    if (!selectedStation) {
        showToast("⚠️ No station selected! Please select a DHA station first.","error");
        return;
    }



    station = selectedStation;

    const stationData = DHA_PHASES.find(
        p => p.name.toUpperCase() === station.toUpperCase()
    );

    if (!stationData) {
        console.error(`❌ Station '${station}' not found`);
        return;
    }

    const { ip, auth_key } = stationData;


    const selectedLayer = layerMap[layerName];
    if (!selectedLayer) {
        console.warn(`⚠️ Layer '${layerName}' not found`);
        return;
    }

    const isV2 = selectedLayer.includes("v2:");
    const workspace = isV2 ? "dha_coregis_v2" : "dha_coregis";
    const wmsBaseUrl = `http://${ip}/geoserver/${workspace}/wms?auth_key=${auth_key}`;


    // 🧹 Clean up if first layer is being added
    if (Object.keys(activeLayers).length === 0 && isChecked) {
        console.log("🧽 No active layers — clearing map of all WMS layers...");
        map.eachLayer(l => {
            if (!l._url || !l._url.includes("geoserver")) return;
            map.removeLayer(l);
        });
    }

    // 🧩 Special handling for purchase_layer
    if (layerName === "purchase_layer") {
        if (isChecked && category) {
            // Add category to list
            if (!purchaseLayerCategories.includes(category)) {
                purchaseLayerCategories.push(category);
                console.log(`✅ Added purchase category: ${category}`);
            }
        } else if (!isChecked && category) {
            // Remove category from list
            purchaseLayerCategories = purchaseLayerCategories.filter(c => c !== category);
            console.log(`🗑️ Removed purchase category: ${category}`);
        }

        // Remove any previous purchase layer before redrawing
        if (activeLayers["purchase_layer"]) {
            map.removeLayer(activeLayers["purchase_layer"]);
            delete activeLayers["purchase_layer"];
        }

        // Rebuild if there are still active categories
        if (purchaseLayerCategories.length > 0) {
            const cqlFilter = `category IN ('${purchaseLayerCategories.join("','")}')`;
            const wmsLayer = L.tileLayer.wms(wmsBaseUrl, {
                layers:  selectedLayer,
                format: "image/png",
                transparent: true,
                version: "1.1.0",
                attribution: "GeoServer",
                cql_filter: cqlFilter
            }).addTo(map);

            activeLayers["purchase_layer"] = wmsLayer;
            console.log(`🎯 Re-rendered purchase_layer with filters: ${cqlFilter}`);
        } else {
            console.log("🚫 No active purchase categories — layer removed");
        }

        console.table(purchaseLayerCategories.map(c => ({ ActiveCategory: c })));
        return; // stop here — rest of logic is for other layers
    }

    // ✅ Regular layer handling (non-purchase layers)
    if (isChecked) {
        const wmsLayer = L.tileLayer.wms(wmsBaseUrl, {
            layers: selectedLayer,
            format: "image/png",
            transparent: true,
            version: "1.1.0",
            attribution: "GeoServer"
        }).addTo(map);

        activeLayers[layerName] = wmsLayer;
        console.log(`✅ Added layer: ${layerName}`);
    } else {
        if (activeLayers[layerName]) {
            map.removeLayer(activeLayers[layerName]);
            delete activeLayers[layerName];
            console.log(`🗑️ Removed layer: ${layerName}`);
        }
    }

    // 🧾 Debug logs
    console.table(Object.keys(activeLayers).map(l => ({ ActiveLayer: l })));
}


// ==================== 🚀 AUTO INIT ====================
initMap();
