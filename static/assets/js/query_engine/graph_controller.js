/**
 * GraphController.js
 * Handles the graph visualization dashboard functionality for the Query Engine
 */

class GraphController {
    constructor() {
        // Core data properties
        this.dhaServers = {};
        this.availableLayers = [];
        this.layerFields = {};
        this.selectedServers = new Set();
        this.selectedLayer = '';
        this.selectedXAxis = '';
        this.selectedYAxes = new Set();
        this.summaryTechniques = {};
        this.graphs = [];
        this.nextGraphId = 1;
        
        // UI elements
        this.elements = {};
        
        // Initialize the controller
        this.initialize();
    }

    /**
     * Initialize the controller
     */
    async initialize() {
        console.log('Initializing GraphController');
        
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Load configuration
        await this.loadConfiguration();
        
        // Initialize Sortable for graph containers
        this.initializeSortable();
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        // Configuration panel elements
        this.elements.configPanel = document.getElementById('configPanel');
        this.elements.toggleConfigPanel = document.getElementById('toggleConfigPanel');
        
        // Server selection elements
        this.elements.selectAllServers = document.getElementById('selectAllServers');
        this.elements.serverList = document.getElementById('serverList');
        
        // Layer selection elements
        this.elements.layerSelect = document.getElementById('layerSelect');
        this.elements.layerConnectionStatus = document.getElementById('layerStatus');
        
        // Field selection elements
        this.elements.xAxisField = document.getElementById('xAxisSelect');
        this.elements.yAxisFields = document.getElementById('yAxisFields');
        this.elements.summaryTechniques = document.getElementById('summaryTechniques');
        
        // Graph configuration elements
        this.elements.graphType = document.getElementById('graphTypeSelect');
        this.elements.graphTitle = document.getElementById('graphTitle');
        this.elements.addGraphBtn = document.getElementById('addGraphBtn');
        
        // Graph display elements
        this.elements.graphsContainer = document.getElementById('graphsContainer');
        this.elements.emptyState = document.getElementById('emptyState');
        
        // Dashboard controls
        this.elements.saveDashboardBtn = document.getElementById('saveLayoutBtn');
        this.elements.loadDashboardBtn = document.getElementById('loadLayoutInput');
        this.elements.dashboardFileInput = document.getElementById('loadLayoutInput');
        this.elements.clearDashboardBtn = document.getElementById('clearAllGraphsBtn');
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Toggle configuration panel
        this.elements.toggleConfigPanel.addEventListener('click', () => this.toggleConfigPanel());
        
        // Server selection events
        this.elements.selectAllServers.addEventListener('change', (e) => this.handleSelectAllServers(e.target.checked));
        
        // Test connection button
        const testConnectionBtn = document.getElementById('testConnectionBtn');
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => this.testSelectedServers());
        }
        
        // Layer selection events
        this.elements.layerSelect.addEventListener('change', (e) => this.handleLayerSelect(e.target.value));
        
        // Field selection events
        this.elements.xAxisField.addEventListener('change', (e) => this.handleXAxisSelect(e.target.value));
        
        // Graph controls
        this.elements.addGraphBtn.addEventListener('click', () => this.addGraph());
        this.elements.clearDashboardBtn.addEventListener('click', () => this.clearAllGraphs());
        
        // Dashboard controls
        this.elements.saveDashboardBtn.addEventListener('click', () => this.saveDashboard());
        this.elements.dashboardFileInput.addEventListener('change', (e) => this.loadDashboard(e));
    }
    
    /**
     * Show a message to the user
     * @param {string} type - The type of message (success, error, info)
     * @param {string} message - The message to display
     */
    showMessage(type, message) {
        const messageElement = document.getElementById('connectionMessage');
        if (!messageElement) return;
        
        // Clear any existing messages
        messageElement.innerHTML = '';
        messageElement.className = 'mt-2 small';
        
        // Add the appropriate class based on message type
        switch (type) {
            case 'success':
                messageElement.classList.add('text-success');
                break;
            case 'error':
                messageElement.classList.add('text-danger');
                break;
            case 'info':
            default:
                messageElement.classList.add('text-info');
                break;
        }
        
        // Set the message text
        messageElement.textContent = message;
        
        // Auto-hide the message after 5 seconds
        setTimeout(() => {
            messageElement.textContent = '';
        }, 5000);
    }

    /**
     * Load servers and layers from configuration
     */
    async loadConfiguration() {
        try {
            // Load DHA servers
            this.dhaServers = await ConfigLoader.getDHAServers();
            this.renderServerList();
            
            // Load available layers
            this.availableLayers = await ConfigLoader.getQueryEngineLayers();
            
            console.log('Configuration loaded successfully');
        } catch (error) {
            this.handleError('Failed to load configuration', error);
        }
    }

    /**
     * Initialize Sortable.js for drag-and-drop functionality
     */
    initializeSortable() {
        // Use jQuery UI sortable for the graphs container
        $(this.elements.graphsContainer).sortable({
            handle: '.graph-drag-handle',
            placeholder: 'graph-container col-lg-6 col-md-12 col-12 placeholder',
            tolerance: 'pointer',
            start: function(e, ui) {
                ui.placeholder.height(ui.item.height());
            }
        });
    }

    /**
     * Toggle the configuration panel visibility
     */
    toggleConfigPanel() {
        this.elements.configPanel.classList.toggle('collapsed');
        
        // Update the toggle button icon
        const icon = this.elements.toggleConfigPanel.querySelector('i');
        if (this.elements.configPanel.classList.contains('collapsed')) {
            icon.classList.remove('bi-arrow-left');
            icon.classList.add('bi-arrow-right');
        } else {
            icon.classList.remove('bi-arrow-right');
            icon.classList.add('bi-arrow-left');
        }
    }

    /**
     * Render the server list with checkboxes
     */
    renderServerList() {
        if (!this.dhaServers || Object.keys(this.dhaServers).length === 0) {
            this.elements.serverList.innerHTML = '<div class="text-muted">No servers available</div>';
            return;
        }
        
        let html = '';
        
        // Create server items
        Object.keys(this.dhaServers).forEach(serverName => {
            const serverId = `server-${serverName}`;
            // Capitalize the first letter of the server name
            const displayName = serverName.charAt(0).toUpperCase() + serverName.slice(1);
            html += `
                <div class="server-item">
                    <input type="checkbox" class="form-check-input server-checkbox" 
                           id="${serverId}" data-server="${serverName}">
                    <label class="form-check-label" for="${serverId}">
                        ${displayName}
                        <span class="connection-status" id="status-${serverName}"></span>
                    </label>
                </div>
            `;
        });
        
        this.elements.serverList.innerHTML = html;
        
        // Add event listeners to server checkboxes
        const serverCheckboxes = document.querySelectorAll('.server-checkbox');
        serverCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const serverName = e.target.dataset.server;
                if (e.target.checked) {
                    this.selectServer(serverName);
                } else {
                    this.deselectServer(serverName);
                }
                
                // Update "Select All" checkbox state
                this.updateSelectAllState();
            });
        });
    }

    /**
     * Handle "Select All" servers checkbox
     * Automatically refreshes layer selection when server selection changes
     */
    handleSelectAllServers(checked) {
        const serverCheckboxes = document.querySelectorAll('.server-checkbox');
        
        // Store current layer selection before making changes
        const currentLayer = this.selectedLayer;
        
        // Process all checkboxes
        serverCheckboxes.forEach(checkbox => {
            checkbox.checked = checked;
            
            const serverName = checkbox.dataset.server;
            if (checked) {
                // Just add to selected set without triggering individual refreshes
                if (this.dhaServers[serverName]) {
                    this.selectedServers.add(serverName);
                    
                    // Update UI to show selected but not tested status
                    const statusElement = document.getElementById(`status-${serverName}`);
                    statusElement.className = 'connection-status';
                    statusElement.innerHTML = '<i class="bi bi-question-circle" title="Connection not tested"></i>';
                }
            } else {
                // Just remove from selected set without triggering individual refreshes
                this.selectedServers.delete(serverName);
                
                // Reset connection status
                const statusElement = document.getElementById(`status-${serverName}`);
                statusElement.className = 'connection-status';
            }
        });
        
        // Update layer select state
        this.updateLayerSelectState();
        
        // Refresh layer selection once after all servers have been processed
        if (currentLayer && ((checked && this.selectedServers.size > 0) || (!checked && this.selectedServers.size > 0))) {
            // Reset layer selection to trigger a refresh
            this.elements.layerSelect.value = '';
            this.handleLayerSelect('');
            
            // Restore the previous selection to refresh with new server list
            setTimeout(() => {
                this.elements.layerSelect.value = currentLayer;
                this.handleLayerSelect(currentLayer);
            }, 100);
        }
    }

    /**
     * Update the state of the "Select All" checkbox based on selected servers
     */
    updateSelectAllState() {
        const serverCheckboxes = document.querySelectorAll('.server-checkbox');
        const checkedCount = document.querySelectorAll('.server-checkbox:checked').length;
        
        if (checkedCount === 0) {
            this.elements.selectAllServers.checked = false;
            this.elements.selectAllServers.indeterminate = false;
        } else if (checkedCount === serverCheckboxes.length) {
            this.elements.selectAllServers.checked = true;
            this.elements.selectAllServers.indeterminate = false;
        } else {
            this.elements.selectAllServers.indeterminate = true;
        }
    }

    /**
     * Select a server without testing connection immediately
     * Automatically refreshes layer selection when server selection changes
     */
    selectServer(serverName) {
        if (!this.dhaServers[serverName]) {
            this.handleError(`Server ${serverName} not found in configuration`);
            return;
        }
        
        this.selectedServers.add(serverName);
        
        // Update UI to show selected but not tested status
        const statusElement = document.getElementById(`status-${serverName}`);
        statusElement.className = 'connection-status';
        statusElement.innerHTML = '<i class="bi bi-question-circle" title="Connection not tested"></i>';
        
        // Enable layer selection if at least one server is selected
        this.updateLayerSelectState();
        
        // If a layer is already selected, refresh it to update with the new server
        if (this.selectedLayer) {
            // Store the current layer selection
            const currentLayer = this.selectedLayer;
            
            // Reset layer selection to trigger a refresh
            this.elements.layerSelect.value = '';
            this.handleLayerSelect('');
            
            // Restore the previous selection to refresh with new server
            setTimeout(() => {
                this.elements.layerSelect.value = currentLayer;
                this.handleLayerSelect(currentLayer);
            }, 100);
        }
    }
    
    /**
     * Test connection for all selected servers
     */
    async testSelectedServers() {
        console.log('Testing connection for all selected servers');
        
        if (this.selectedServers.size === 0) {
            console.warn('No servers selected to test');
            return;
        }
        
        // Update UI to show we're testing connections
        document.getElementById('testConnectionBtn').disabled = true;
        document.getElementById('testConnectionBtn').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Testing...';
        
        let hasConnectedServer = false;
        
        // Test each selected server
        for (const serverName of this.selectedServers) {
            // Update UI to show connecting status
            const statusElement = document.getElementById(`status-${serverName}`);
            statusElement.className = 'connection-status';
            statusElement.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Connecting...</span></div>';
            
            try {
                // Test server connection
                const connected = await this.testServerConnection(serverName);
                
                // Update connection status indicator
                statusElement.innerHTML = '';
                if (connected) {
                    statusElement.classList.add('connected');
                    hasConnectedServer = true;
                } else {
                    statusElement.classList.add('disconnected');
                }
            } catch (error) {
                statusElement.classList.add('disconnected');
                this.handleError(`Failed to connect to server ${serverName}`, error);
            }
        }
        
        // Reset the test button
        document.getElementById('testConnectionBtn').disabled = false;
        document.getElementById('testConnectionBtn').innerHTML = '<i class="bi bi-lightning-charge"></i> Test Connection';
        
        // Show a message based on the results
        if (hasConnectedServer) {
            this.showMessage('success', 'Successfully connected to at least one server');
        } else {
            this.showMessage('error', 'Failed to connect to any selected server');
        }
    }

    /**
     * Deselect a server
     * Automatically refreshes layer selection when server selection changes
     */
    deselectServer(serverName) {
        this.selectedServers.delete(serverName);
        
        // Reset connection status
        const statusElement = document.getElementById(`status-${serverName}`);
        statusElement.className = 'connection-status';
        
        // Update layer select state
        this.updateLayerSelectState();
        
        // If a layer is still selected and we still have servers selected, refresh the layer data
        if (this.selectedLayer && this.selectedServers.size > 0) {
            // Store the current layer selection
            const currentLayer = this.selectedLayer;
            
            // Reset layer selection to trigger a refresh
            this.elements.layerSelect.value = '';
            this.handleLayerSelect('');
            
            // Restore the previous selection to refresh with updated server list
            setTimeout(() => {
                this.elements.layerSelect.value = currentLayer;
                this.handleLayerSelect(currentLayer);
            }, 100);
        }
    }

    /**
     * Test connection to a server using the backend API
     */
    async testServerConnection(serverName) {
        console.log(`Testing connection to server: ${serverName}`);
        if (!this.dhaServers[serverName]) {
            console.error(`Server ${serverName} not found in configuration`);
            return false;
        }
        
        try {
            console.log(`Using backend API to check connectivity for server: ${serverName}`);
            
            // Use our backend API endpoint to check server connectivity
            const apiUrl = `/api/dha/server/check?server=${encodeURIComponent(serverName)}`;
            
            // Log the URL for debugging purposes
            console.log(`Checking server connectivity with URL: ${apiUrl}`);
            console.log(`Server details:`, this.dhaServers[serverName]);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    console.warn(`Server connectivity check failed with status: ${response.status}`);
                    return false;
                }
                
                const data = await response.json();
                console.log(`Server connectivity check response:`, data);
                
                // Check if the server is connected based on the status field
                const isConnected = data.status === 'connected';
                console.log(`Server ${serverName} connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
                
                return isConnected;
            } catch (error) {
                clearTimeout(timeoutId);
                console.warn(`Connection check API call failed:`, error.message);
                return false;
            }
        } catch (error) {
            console.error(`Error in testServerConnection for ${serverName}:`, error);
            return false;
        }
    }

    /**
     * Update the layer select dropdown state based on selected servers
     */
    updateLayerSelectState() {
        const hasSelectedServers = this.selectedServers.size > 0;
        
        this.elements.layerSelect.disabled = !hasSelectedServers;
        
        if (hasSelectedServers) {
            // Populate layer options if not already done
            if (this.elements.layerSelect.options.length <= 1) {
                this.populateLayerOptions();
            }
        } else {
            // Reset layer selection if no servers selected
            this.elements.layerSelect.value = '';
            this.handleLayerSelect('');
        }
    }

    /**
     * Populate layer options in the dropdown with groups and custom labels
     */
    populateLayerOptions() {
        // Clear existing options except the first one
        while (this.elements.layerSelect.options.length > 1) {
            this.elements.layerSelect.remove(1);
        }
        
        // Check if layers have groups structure
        if (this.availableLayers.groups && Array.isArray(this.availableLayers.groups)) {
            // Create layer options with optgroups for each group
            this.availableLayers.groups.forEach(group => {
                // Create optgroup for this group
                const optgroup = document.createElement('optgroup');
                optgroup.label = group.name;
                
                // Add layers in this group
                if (group.layers && Array.isArray(group.layers)) {
                    group.layers.forEach(layer => {
                        const option = document.createElement('option');
                        option.value = layer.id;
                        option.textContent = layer.label || layer.id;
                        optgroup.appendChild(option);
                    });
                }
                
                // Add the optgroup to the select element
                this.elements.layerSelect.appendChild(optgroup);
            });
        } else if (this.availableLayers.flat && Array.isArray(this.availableLayers.flat)) {
            // Fallback to flat list if no groups are defined
            this.availableLayers.flat.forEach(layer => {
                const option = document.createElement('option');
                option.value = layer;
                option.textContent = layer;
                this.elements.layerSelect.appendChild(option);
            });
        } else if (Array.isArray(this.availableLayers)) {
            // Legacy support for old format (simple array)
            this.availableLayers.forEach(layer => {
                const option = document.createElement('option');
                option.value = layer;
                option.textContent = layer;
                this.elements.layerSelect.appendChild(option);
            });
        }
    }

    /**
     * Handle layer selection
     */
    async handleLayerSelect(layerName) {
        this.selectedLayer = layerName;
        
        // Reset field selections
        this.selectedXAxis = '';
        this.selectedYAxes.clear();
        this.summaryTechniques = {};
        
        // Update UI
        this.elements.xAxisField.value = '';
        this.elements.xAxisField.disabled = !layerName;
        this.elements.yAxisFields.innerHTML = layerName ? 
            '<div class="loading-indicator"><div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div></div>' : 
            '<div class="text-muted small">Select a layer to view available fields</div>';
        this.elements.summaryTechniques.innerHTML = '<div class="text-muted small">Select Y-Axis fields to view summarization options</div>';
        
        // Update layer connection status
        this.elements.layerConnectionStatus.innerHTML = '';
        
        if (!layerName) {
            this.elements.addGraphBtn.disabled = true;
            return;
        }
        
        try {
            // Show connecting status
            this.elements.layerConnectionStatus.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                        <span class="visually-hidden">Connecting...</span>
                    </div>
                    <span>Connecting to layer...</span>
                </div>
            `;
            
            // Fetch layer fields (simulated)
            await this.fetchLayerFields(layerName);
            
            // Show success status
            this.elements.layerConnectionStatus.innerHTML = `
                <div class="d-flex align-items-center text-success">
                    <i class="bi bi-check-circle me-2"></i>
                    <span>Connected to layer</span>
                </div>
            `;
            
            // Populate field dropdowns
            await this.populateFieldOptions();
            
        } catch (error) {
            // Show error status
            this.elements.layerConnectionStatus.innerHTML = `
                <div class="d-flex align-items-center text-danger">
                    <i class="bi bi-exclamation-circle me-2"></i>
                    <span>Failed to connect to layer</span>
                </div>
            `;
            
            this.handleError(`Failed to fetch fields for layer ${layerName}`, error);
        }
    }

    /**
     * Fetch fields for the selected layer using connected servers
     */
    async fetchLayerFields(layerName) {
        console.log(`Fetching fields for layer: ${layerName}`);
        
        // Check if we have any selected servers
        if (this.selectedServers.size === 0) {
            console.error('No servers selected');
            throw new Error('No servers selected');
        }
        
        try {
            // Find all connected servers to use
            let connectedServers = [];
            
            console.log('Finding connected servers to fetch layer fields...');
            
            // Check each selected server for connectivity
            for (const serverName of this.selectedServers) {
                try {
                    // Use our server connectivity API to check if the server is connected
                    const isConnected = await this.testServerConnection(serverName);
                    
                    if (isConnected) {
                        console.log(`Server ${serverName} is connected and available`);
                        connectedServers.push(serverName);
                    } else {
                        console.log(`Server ${serverName} is not connected, skipping`);
                    }
                } catch (error) {
                    console.warn(`Error checking connectivity for server ${serverName}:`, error);
                }
            }
            
            // If no connected servers were found, throw an error
            if (connectedServers.length === 0) {
                console.error('No connected servers found');
                throw new Error('No connected servers found. Please select at least one available server.');
            }
            
            // Use the first connected server to fetch field information
            // Later we'll fetch data from all connected servers
            const targetServer = connectedServers[0];
            
            const serverDetails = this.dhaServers[targetServer];
            if (!serverDetails) {
                console.error(`Server details not found for ${targetServer}`);
                throw new Error(`Server details not found for ${targetServer}`);
            }
            
            console.log(`Using server for field information: ${targetServer}`, serverDetails);
            console.log(`All connected servers that will be used for data: ${connectedServers.join(', ')}`);
            
            // Store the list of connected servers for later use when fetching data
            this.connectedServers = connectedServers;
            
            // Construct the URL for the WFS DescribeFeatureType request with workspace and authkey
            // This is a standard GeoServer WFS request to get the field information
            const workspace = 'dha_coregis'; // Use the workspace name as specified by the user
            const wfsUrl = `http://${serverDetails.dhaip}/geoserver/${workspace}/wfs`;
            const params = new URLSearchParams({
                service: 'WFS',
                version: '2.0.0',
                request: 'DescribeFeatureType',
                typeName: `${workspace}:${layerName}`,
                outputFormat: 'application/json',
                authkey: serverDetails.auth_key // Add the authkey as a URL parameter
            });
            
            const url = `${wfsUrl}?${params.toString()}`;
            console.log(`Fetching layer fields from: ${url}`);
            
            // Add detailed logging for debugging
            console.log('Request details:', {
                url,
                workspace,
                authkey: serverDetails.auth_key,
                typeName: `${workspace}:${layerName}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log(`Full WFS URL with params: ${url}`);
            console.log(`Using workspace: ${workspace} and layer: ${layerName}`);
            console.log(`Server auth key: ${serverDetails.auth_key}`);
            
            // Make the actual API call to fetch layer fields
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            try {
                
                // Note: We're now passing the authkey as a URL parameter instead of in the Authorization header
                // This is how GeoServer typically handles authentication with authkey
                const reqURL = `/api/proxy/geoserver/?url=${encodeURIComponent(url)}&${params.toString()}`
                const response = await fetch(reqURL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    signal: controller.signal,
                    credentials: 'include' // Include credentials in the request
                });
                
                clearTimeout(timeoutId);
                console.log(`Response status: ${response.status}`);
                
                if (!response.ok) {
                    console.warn(`HTTP error! status: ${response.status}`);
                    // If we can't get the real data, use fallback data
                    console.log('Using fallback field data due to server error');
                    this.layerFields[layerName] = await this.getFallbackFields(layerName);
                } else {
                    try {
                        const data = await response.json();
                        console.log('Field data received:', data);
                        
                        // Process the WFS DescribeFeatureType response to extract field information
                        const processedFields = await this.processFieldData(data);
                        
                        if (processedFields && processedFields.length > 0) {
                            this.layerFields[layerName] = processedFields;
                            console.log(`Processed ${processedFields.length} fields for layer ${layerName}`);
                        } else {
                            console.warn('No fields found in response, using fallback data');
                            this.layerFields[layerName] = await this.getFallbackFields(layerName);
                        }
                    } catch (parseError) {
                        console.error('Error parsing response:', parseError);
                        this.layerFields[layerName] = await this.getFallbackFields(layerName);
                    }
                }
            } catch (error) {
                clearTimeout(timeoutId);
                console.error(`Error fetching fields: ${error.message}`);
                
                // Use fallback data if the request fails
                console.log('Using fallback field data due to request error');
                this.layerFields[layerName] = await this.getFallbackFields(layerName);
            }
            
            return this.layerFields[layerName];
        } catch (error) {
            console.error(`Error in fetchLayerFields: ${error.message}`);
            // Use fallback data on any error
            this.layerFields[layerName] = await this.getFallbackFields(layerName);
            return this.layerFields[layerName];
        }
    }
    
    /**
     * Process field data from WFS DescribeFeatureType response
     */
    async processFieldData(data) {
        try {
            // This is a simplified example - actual implementation would depend on the
            // exact structure of the GeoServer WFS DescribeFeatureType response
            const fields = [];
            
            if (data && data.featureTypes && data.featureTypes[0] && data.featureTypes[0].properties) {
                data.featureTypes[0].properties.forEach(prop => {
                    let type = 'text'; // Default type
                    
                    // Map GeoServer/WFS types to our simplified types
                    if (prop.type.includes('int') || prop.type.includes('double') || 
                        prop.type.includes('float') || prop.type.includes('decimal')) {
                        type = 'numeric';
                    } else if (prop.type.includes('date') || prop.type.includes('time')) {
                        type = 'date';
                    }
                    
                    fields.push({
                        name: prop.name,
                        type: type
                    });
                });
            }
            
            // Filter fields based on allowed fields from server
            return await this.filterAllowedFields(fields);
        } catch (error) {
            console.error('Error processing field data:', error);
            return []; // Return empty array on error
        }
    }
    
    /**
     * Filter fields based on allowed fields from server
     */
    async filterAllowedFields(fields) {
        try {
            console.log('Filtering fields based on allowed fields');
            
            // Try to use the API endpoint to filter fields
            try {
                const response = await fetch('/api/config/filter-fields', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fields: fields })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Filtered fields from server:', data.filtered_fields);
                return data.filtered_fields;
            } catch (error) {
                console.error('Error filtering fields via API, falling back to client-side filtering:', error);
                
                // Fallback: Get allowed fields and filter client-side
                try {
                    const response = await fetch('/api/config/allowed-fields');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    const allowedFields = data.allowed_fields;
                    
                    console.log('Allowed fields from server:', allowedFields);
                    // Convert allowed fields to lowercase for case-insensitive comparison
                    const allowedFieldsLower = allowedFields.map(field => field.toLowerCase());
                    return fields.filter(field => allowedFieldsLower.includes(field.name.toLowerCase()));
                } catch (fallbackError) {
                    console.error('Error getting allowed fields, returning all fields:', fallbackError);
                    return fields; // Return all fields if both methods fail
                }
            }
        } catch (error) {
            console.error('Error in filterAllowedFields:', error);
            return fields; // Return all fields on error
        }
    }

    /**
     * Get fallback fields for a layer when server connection fails
     */
    async getFallbackFields(layerName) {
        console.log(`Providing fallback fields for layer: ${layerName}`);
        
        // Common fields that might be present in most layers
        const commonFields = [
            { name: 'id', type: 'numeric' },
            { name: 'name', type: 'text' },
            { name: 'description', type: 'text' }
        ];
        
        // Layer-specific fields based on the layer name
        let specificFields = [];
        
        // Customize fields based on the layer name
        // This is just an example - in a real application, you would have more accurate fallback data
        switch (layerName) {
            case 'dte_land_khasra':
                specificFields = [
                    { name: 'khasra_no', type: 'text' },
                    { name: 'area', type: 'numeric' },
                    { name: 'owner', type: 'text' },
                    { name: 'location', type: 'text' },
                    { name: 'acquisition_date', type: 'date' },
                    { name: 'status', type: 'text' }
                ];
                break;
                
            case 'plot_summary':
                specificFields = [
                    { name: 'plot_no', type: 'text' },
                    { name: 'block', type: 'text' },
                    { name: 'size', type: 'numeric' },
                    { name: 'category', type: 'text' },
                    { name: 'price', type: 'numeric' },
                    { name: 'status', type: 'text' },
                    { name: 'allocation_date', type: 'date' }
                ];
                break;
                
            case 'electric_utility_line':
                specificFields = [
                    { name: 'line_id', type: 'text' },
                    { name: 'type', type: 'text' },
                    { name: 'voltage', type: 'numeric' },
                    { name: 'length', type: 'numeric' },
                    { name: 'installation_date', type: 'date' },
                    { name: 'status', type: 'text' }
                ];
                break;
                
            default:
                // Generic fields for unknown layers
                specificFields = [
                    { name: 'category', type: 'text' },
                    { name: 'value', type: 'numeric' },
                    { name: 'count', type: 'numeric' },
                    { name: 'date', type: 'date' },
                    { name: 'status', type: 'text' },
                    { name: 'region', type: 'text' },
                    { name: 'latitude', type: 'numeric' },
                    { name: 'longitude', type: 'numeric' }
                ];
        }
        
        // Combine common and specific fields and filter by allowed fields
        const allFields = [...commonFields, ...specificFields];
        return await this.filterAllowedFields(allFields);
    }

    /**
     * Populate X and Y axis field options
     */
    async populateFieldOptions() {
        const fields = this.layerFields[this.selectedLayer] || [];
        
        // Populate X-Axis dropdown
        while (this.elements.xAxisField.options.length > 1) {
            this.elements.xAxisField.remove(1);
        }
        
        fields.forEach(field => {
            const option = document.createElement('option');
            option.value = field.name;
            option.textContent = field.name;
            this.elements.xAxisField.appendChild(option);
        });
        
        // Populate Y-Axis checkboxes
        let yAxisHtml = '';
        fields.forEach(field => {
            const fieldId = `y-axis-${field.name}`;
            yAxisHtml += `
                <div class="y-axis-field-item">
                    <input type="checkbox" class="form-check-input y-axis-checkbox" 
                           id="${fieldId}" data-field="${field.name}" data-type="${field.type}">
                    <label class="form-check-label" for="${fieldId}">
                        ${field.name} <small class="text-muted">(${field.type})</small>
                    </label>
                </div>
            `;
        });
        
        this.elements.yAxisFields.innerHTML = yAxisHtml;
        
        // Add event listeners to Y-Axis checkboxes
        const yAxisCheckboxes = document.querySelectorAll('.y-axis-checkbox');
        yAxisCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const fieldName = e.target.dataset.field;
                const fieldType = e.target.dataset.type;
                
                if (e.target.checked) {
                    this.selectedYAxes.add(fieldName);
                    this.updateSummaryTechniques(fieldName, fieldType);
                } else {
                    this.selectedYAxes.delete(fieldName);
                    this.removeSummaryTechnique(fieldName);
                }
                
                // Update Add Graph button state
                this.updateAddGraphButtonState();
            });
        });
    }

    /**
     * Handle X-Axis field selection
     */
    handleXAxisSelect(fieldName) {
        this.selectedXAxis = fieldName;
        this.updateAddGraphButtonState();
    }

    /**
     * Update summary techniques for a selected Y-Axis field
     */
    updateSummaryTechniques(fieldName, fieldType) {
        // Define available techniques based on field type
        let techniques = [];
        
        if (fieldType === 'numeric') {
            techniques = ['sum', 'count', 'max', 'min', 'mean'];
        } else if (fieldType === 'text') {
            techniques = ['count', 'count_unique', 'count_distinct'];
        } else if (fieldType === 'date') {
            techniques = ['count', 'min', 'max'];
        }
        
        // Store techniques for this field
        this.summaryTechniques[fieldName] = {
            type: fieldType,
            techniques: techniques,
            selected: techniques[0] // Default to first technique
        };
        
        // Update summary techniques UI
        this.renderSummaryTechniques();
    }

    /**
     * Remove summary technique for a deselected Y-Axis field
     */
    removeSummaryTechnique(fieldName) {
        delete this.summaryTechniques[fieldName];
        this.renderSummaryTechniques();
    }

    /**
     * Render summary techniques UI
     */
    renderSummaryTechniques() {
        const fields = Object.keys(this.summaryTechniques);
        
        if (fields.length === 0) {
            this.elements.summaryTechniques.innerHTML = '<div class="text-muted small">Select Y-Axis fields to view summarization options</div>';
            return;
        }
        
        let html = '';
        
        fields.forEach(fieldName => {
            const fieldInfo = this.summaryTechniques[fieldName];
            const techniques = fieldInfo.techniques;
            
            html += `
                <div class="summary-technique-item">
                    <div class="mb-2"><strong>${fieldName}</strong></div>
                    <div class="d-flex flex-wrap gap-2">
            `;
            
            techniques.forEach(technique => {
                const techniqueId = `technique-${fieldName}-${technique}`;
                const isSelected = fieldInfo.selected === technique;
                
                html += `
                    <div class="form-check form-check-inline">
                        <input type="radio" class="form-check-input technique-radio" 
                               id="${techniqueId}" name="technique-${fieldName}" 
                               data-field="${fieldName}" data-technique="${technique}" 
                               ${isSelected ? 'checked' : ''}>
                        <label class="form-check-label" for="${techniqueId}">
                            ${this.formatTechniqueName(technique)}
                        </label>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        this.elements.summaryTechniques.innerHTML = html;
        
        // Add event listeners to technique radios
        const techniqueRadios = document.querySelectorAll('.technique-radio');
        techniqueRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const fieldName = e.target.dataset.field;
                    const technique = e.target.dataset.technique;
                    
                    if (this.summaryTechniques[fieldName]) {
                        this.summaryTechniques[fieldName].selected = technique;
                    }
                }
            });
        });
    }

    /**
     * Format technique name for display
     */
    formatTechniqueName(technique) {
        switch (technique) {
            case 'sum': return 'Sum';
            case 'count': return 'Count';
            case 'count_unique': return 'SUM (Estimated)';
            case 'count_distinct': return 'Count Unique (Distinct)';
            case 'max': return 'Maximum';
            case 'min': return 'Minimum';
            case 'mean': return 'Average';
            default: return technique;
        }
    }

    /**
     * Update the state of the Add Graph button
     */
    updateAddGraphButtonState() {
        const canAddGraph = 
            this.selectedLayer && 
            this.selectedXAxis && 
            this.selectedYAxes.size > 0;
        
        this.elements.addGraphBtn.disabled = !canAddGraph;
    }

    /**
     * Add a new graph to the dashboard
     */
    addGraph() {
        // Validate required selections
        if (!this.selectedLayer || !this.selectedXAxis || this.selectedYAxes.size === 0) {
            this.handleError('Please select layer, X-Axis field, and at least one Y-Axis field');
            return;
        }
        
        // Store currently selected servers for this specific graph
        const graphServers = {};
        this.selectedServers.forEach(serverName => {
            if (this.dhaServers[serverName]) {
                graphServers[serverName] = this.dhaServers[serverName];
            }
        });
        
        // Create graph configuration
        const graphConfig = {
            id: this.nextGraphId++,
            title: this.elements.graphTitle.value || `Graph ${this.graphs.length + 1}`,
            type: this.elements.graphType.value,
            layer: this.selectedLayer,
            xAxis: this.selectedXAxis,
            yAxes: Array.from(this.selectedYAxes),
            summaryTechniques: JSON.parse(JSON.stringify(this.summaryTechniques)),
            servers: {
                selected: Array.from(this.selectedServers),
                details: graphServers
            }
        };
        
        // Add to graphs array
        this.graphs.push(graphConfig);
        
        // Create and render the graph
        this.renderGraph(graphConfig);
        
        // Hide empty state if this is the first graph
        if (this.graphs.length === 1) {
            this.elements.emptyState.style.display = 'none';
        }
    }

    /**
     * Render a graph in the dashboard
     */
    renderGraph(graphConfig) {
        // Create graph container
        const graphContainer = document.createElement('div');
        graphContainer.className = 'graph-container col-lg-12 col-md-12 col-12';
        graphContainer.dataset.graphId = graphConfig.id;
        
        // Create graph card
        graphContainer.innerHTML = `
            <div class="card">
                <div class="graph-header bg-success">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-arrows-move graph-drag-handle"></i>
                        <h5 class="graph-title">${graphConfig.title}</h5>
                    </div>
                    <div class="graph-actions">
                        <button type="button" class="btn btn-sm btn-outline-secondary collapse-graph-btn" data-graph-id="${graphConfig.id}">
                            <i class="bi bi-dash"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary maximize-graph-btn" data-graph-id="${graphConfig.id}">
                            <i class="bi bi-arrows-fullscreen"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger remove-graph-btn" data-graph-id="${graphConfig.id}">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                </div>
                <div class="graph-body" id="graph-${graphConfig.id}">
                    <div class="loading-indicator">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const emptyState = document.getElementById("emptyState");
        if (emptyState) emptyState.remove();
        // Add to DOM
        this.elements.graphsContainer.appendChild(graphContainer);
        
        // Add event listeners for graph actions
        const removeBtn = graphContainer.querySelector('.remove-graph-btn');
        removeBtn.addEventListener('click', () => this.removeGraph(graphConfig.id));
        
        // Add event listener for collapse button
        const collapseBtn = graphContainer.querySelector('.collapse-graph-btn');
        collapseBtn.addEventListener('click', () => this.toggleGraphCollapse(graphConfig.id));
        
        // Add event listener for maximize button
        const maximizeBtn = graphContainer.querySelector('.maximize-graph-btn');
        maximizeBtn.addEventListener('click', () => this.toggleGraphMaximize(graphConfig.id));
        
        // Generate the chart
        this.generateChart(graphConfig);
    }

    /**
     * Generate a chart using Highcharts
     */
    async generateChart(graphConfig) {

        console.log("graphConfig : " + graphConfig);
        try {
            // Simulate data fetching
            const data = await this.fetchGraphData(graphConfig);
            
            // Create chart options based on graph type
            const chartOptions = this.createChartOptions(graphConfig, data);
            
            // Render the chart
            Highcharts.chart(`graph-${graphConfig.id}`, chartOptions);
            
        } catch (error) {
            this.handleError(`Failed to generate chart for ${graphConfig.title}`, error);
            
            // Show error in graph container
            const graphElement = document.getElementById(`graph-${graphConfig.id}`);
            if (graphElement) {
                graphElement.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Failed to load chart data
                    </div>
                `;
            }
        }
    }

    /**
     * Fetch data for a graph from all connected servers
     */
    async fetchGraphData(graphConfig) {
        console.log(`Fetching graph data for config:`, graphConfig);
        
        // Determine which servers to use for this graph
        let serversToUse = [];
        
        // If the graph has its own server configuration, use those servers
        if (graphConfig.servers && graphConfig.servers.selected && graphConfig.servers.selected.length > 0) {
            console.log('Using graph-specific servers:', graphConfig.servers.selected);
            serversToUse = graphConfig.servers.selected;
        } else {
            // Otherwise, use the globally connected servers
            if (!this.connectedServers || this.connectedServers.length === 0) {
                showToast('No connected servers available','error');
                console.error('No connected servers available');
                throw new Error('No connected servers available. Please select and connect to at least one server.');
            }
            serversToUse = this.connectedServers;
        }
        
        try {
            // We'll fetch data from all connected servers and combine the results
            const allServerData = [];
            
            // For each server to use, fetch the data
            for (const serverName of serversToUse) {
                try {
                    const serverDetails = this.dhaServers[serverName];
                    if (!serverDetails) {
                        console.warn(`Server details not found for ${serverName}, skipping`);
                        continue;
                    }
                    
                    console.log(`Fetching data from server: ${serverName}`);
                    
                    // Construct the URL for the WFS GetFeature request
                    const workspace = 'dha_coregis';
                    const wfsUrl = `http://${serverDetails.dhaip}/geoserver/${workspace}/wfs`;

                    console.log(wfsUrl);
                    
                    // Build the WFS query parameters
                    const params = new URLSearchParams({
                        service: 'WFS',
                        version: '2.0.0',
                        request: 'GetFeature',
                        typeName: `${workspace}:${graphConfig.layer}`,
                        outputFormat: 'application/json',
                        authkey: serverDetails.auth_key,
                        // Add property names to limit the response to just the fields we need
                        propertyName: [graphConfig.xAxis, ...graphConfig.yAxes].join(',')
                    });
                    
                    const url = `${wfsUrl}?${params.toString()}`;
                    console.log(`Fetching data from URL: ${url}`);
                    
                    // Make the API call
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
                    const reqURL = `/api/proxy/geoserver/?url=${encodeURIComponent(url)}&${params.toString()}`
                    const response = await fetch(reqURL, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        console.warn(`Error fetching data from ${serverName}: ${response.status} ${response.statusText}`);
                        continue;
                    }
                    
                    const data = await response.json();
                    console.log(`Data received from ${serverName}:`, data);
                    
                    // Add the server data to our collection
                    if (data && data.features) {
                        // Add server name to each feature for tracking
                        data.features.forEach(feature => {
                            feature.properties.serverName = serverName;
                        });
                        
                        allServerData.push(data);
                    }
                } catch (error) {
                    console.warn(`Error fetching data from server ${serverName}:`, error);
                }
            }
            
            // If we didn't get any data, throw an error
            if (allServerData.length === 0) {
                showToast('No data received from any server', 'error');
                console.error('No data received from any server');
                throw new Error('No data received from any server. Please try again or select different servers.');
            }
            
            // Process and combine the data from all servers
            return this.processGraphData(allServerData, graphConfig);
        } catch (error) {
            console.error(`Error in fetchGraphData:`, error);
            throw error;
        }
    }
    
    /**
     * Process and combine data from multiple servers
     */
    processGraphData(allServerData, graphConfig) {
        console.log(`Processing graph data from ${allServerData.length} servers`);
        
        try {
            // Combine all features from all servers
            const allFeatures = [];
            allServerData.forEach(serverData => {
                if (serverData && serverData.features) {
                    allFeatures.push(...serverData.features);
                }
            });
            
            console.log(`Combined ${allFeatures.length} features from all servers`);
            
            // Extract unique categories (X-Axis values)
            const categoriesSet = new Set();
            allFeatures.forEach(feature => {
                if (feature.properties && feature.properties[graphConfig.xAxis] !== undefined) {
                    categoriesSet.add(feature.properties[graphConfig.xAxis]);
                }
            });
            
            // Convert to array and sort
            const categories = Array.from(categoriesSet).sort();
            console.log(`Extracted ${categories.length} unique categories`);
            
            // Initialize series data
            const seriesData = {};
            graphConfig.yAxes.forEach(field => {
                seriesData[field] = Array(categories.length).fill(0);
            });
            
            // Aggregate data for each category and field
            allFeatures.forEach(feature => {
                if (!feature.properties) return;
                
                const xValue = feature.properties[graphConfig.xAxis];
                if (xValue === undefined) return;
                
                const categoryIndex = categories.indexOf(xValue);
                if (categoryIndex === -1) return;
                
                // For each Y-Axis field, add the value to the corresponding category
                graphConfig.yAxes.forEach(field => {
                    const value = parseFloat(feature.properties[field]);
                    if (!isNaN(value)) {
                        // Apply the selected summary technique
                        const technique = graphConfig.summaryTechniques[field]?.selected || 'sum';
                        
                        switch (technique) {
                            case 'sum':
                                seriesData[field][categoryIndex] += value;
                                break;
                            case 'average':
                                // For average, we'll need to count and sum, then divide later
                                if (!seriesData[`${field}_count`]) {
                                    seriesData[`${field}_count`] = Array(categories.length).fill(0);
                                    seriesData[`${field}_sum`] = Array(categories.length).fill(0);
                                }
                                seriesData[`${field}_count`][categoryIndex]++;
                                seriesData[`${field}_sum`][categoryIndex] += value;
                                break;
                            case 'max':
                                if (seriesData[field][categoryIndex] < value || seriesData[field][categoryIndex] === 0) {
                                    seriesData[field][categoryIndex] = value;
                                }
                                break;
                            case 'min':
                                if (seriesData[field][categoryIndex] > value || seriesData[field][categoryIndex] === 0) {
                                    seriesData[field][categoryIndex] = value;
                                }
                                break;
                            case 'count':
                                seriesData[field][categoryIndex]++;
                                break;
                            case 'count_distinct':
                                // Initialize unique value sets if not already done
                                if (!seriesData[`${field}_unique_values`]) {
                                    seriesData[`${field}_unique_values`] = Array(categories.length).fill().map(() => new Set());
                                }
                                // Add the raw text value to the set for this category
                                const rawValue = feature.properties[field];
                                if (rawValue !== undefined && rawValue !== null) {
                                    seriesData[`${field}_unique_values`][categoryIndex].add(String(rawValue));
                                }
                                // Update the count to the current size of the set
                                seriesData[field][categoryIndex] = seriesData[`${field}_unique_values`][categoryIndex].size;
                                break;
                            default:
                                seriesData[field][categoryIndex] += value;
                        }
                    }
                });
            });
            
            // Calculate averages if needed and clean up temporary data
            graphConfig.yAxes.forEach(field => {
                const technique = graphConfig.summaryTechniques[field]?.selected || 'sum';
                if (technique === 'average' && seriesData[`${field}_count`] && seriesData[`${field}_sum`]) {
                    for (let i = 0; i < categories.length; i++) {
                        if (seriesData[`${field}_count`][i] > 0) {
                            seriesData[field][i] = seriesData[`${field}_sum`][i] / seriesData[`${field}_count`][i];
                        }
                    }
                    // Clean up temporary data
                    delete seriesData[`${field}_count`];
                    delete seriesData[`${field}_sum`];
                }
                
                // Clean up temporary data for count_distinct
                if (technique === 'count_distinct' && seriesData[`${field}_unique_values`]) {
                    delete seriesData[`${field}_unique_values`];
                }
            });
            
            console.log('Processed graph data:', { categories, seriesData });
            
            return {
                categories: categories,
                series: seriesData
            };
        } catch (error) {
            console.error('Error processing graph data:', error);
            throw error;
        }
    }

    /**
     * Create Highcharts options based on graph configuration
     */
    createChartOptions(graphConfig, data) {
        const series = [];
        
        // Create series for each Y-Axis field
        graphConfig.yAxes.forEach(field => {
            const technique = graphConfig.summaryTechniques[field]?.selected || 'count';
            const techniqueLabel = this.formatTechniqueName(technique);
            
            // Round numeric values to 2 decimal places for display
            const roundedData = data.series[field].map(value => {
                return typeof value === 'number' ? value : value;
            });
            
            series.push({
                name: `${field} (${techniqueLabel})`,
                data: roundedData
            });
        });
        
        // Base chart options
        const options = {
            chart: {
                type: graphConfig.type
            },
            title: {
                text: null // Remove duplicate title
            },
            xAxis: {
                categories: data.categories,
                title: {
                    text: graphConfig.xAxis
                }
            },
            yAxis: {
                title: {
                    text: 'Value'
                }
            },
            plotOptions: {
                series: {
                    allowPointSelect: true,
                    cursor: 'pointer'
                }
            },
            tooltip: {
                formatter: function() {
                    // Round values to 2 decimal places in tooltips
                    let value = this.y;
                    if (typeof value === 'number') {
                        value = value.toFixed(2);
                    }
                    // Include the group field (x-axis) value in the tooltip
                    // Use the actual category value from categories array instead of index
                    const groupField = graphConfig.xAxis;
                    const categoryValue = this.point.category || this.x;
                    return `<b>${groupField}: ${categoryValue}</b><br/>${this.series.name}: ${value}`;
                }
            },
            series: series,
            credits: {
                enabled: false
            },
            exporting: {
                enabled: true
            }
        };
        
        // Specific options for different chart types
        if (graphConfig.type === 'pie') {
            // For pie charts, we need to restructure the data
            options.series = [{
                name: 'Value',
                data: data.categories.map((category, i) => ({
                    name: category,
                    y: series[0].data[i],
                    // Format the data label to show category and value with 2 decimal places
                    dataLabels: {
                        formatter: function() {
                            // Use the actual category name instead of index
                            return `${this.point.name}: ${this.y.toFixed(2)}`;
                        }
                    }
                }))
            }];
        }
        
        // Add data labels with 2 decimal places for all chart types
        if (!options.plotOptions.series.dataLabels) {
            options.plotOptions.series.dataLabels = {
                enabled: true,
                formatter: function() {
                    // Format the value to 2 decimal places if it's a number
                    let formattedValue;
                    if (typeof this.y === 'number') {
                        formattedValue = this.y.toFixed(2);
                    } else {
                        formattedValue = this.y;
                    }
                    
                    // For non-pie charts, just show the value
                    // The category is already shown on the x-axis
                    return formattedValue;
                }
            };
        }
        
        return options;
    }

    /**
     * Remove a graph from the dashboard
     */
    removeGraph(graphId) {
        // Remove from graphs array
        this.graphs = this.graphs.filter(graph => graph.id !== graphId);
        
        // Remove from DOM
        const graphContainer = document.querySelector(`.graph-container[data-graph-id="${graphId}"]`);
        if (graphContainer) {
            graphContainer.remove();
        }
        
        // Show empty state if no graphs left
        if (this.graphs.length === 0) {
            this.elements.emptyState.style.display = '';
        }
    }

    /**
     * Toggle maximize state of a graph
     */
    toggleGraphMaximize(graphId) {
        const graphContainer = document.querySelector(`.graph-container[data-graph-id="${graphId}"]`);
        if (!graphContainer) return;
        
        const card = graphContainer.querySelector('.card');
        const maximizeBtn = graphContainer.querySelector('.maximize-graph-btn i');
        
        if (card.classList.contains('maximized')) {
            // Minimize the graph
            card.classList.remove('maximized');
            document.body.classList.remove('graph-maximized');
            maximizeBtn.classList.remove('bi-fullscreen-exit');
            maximizeBtn.classList.add('bi-arrows-fullscreen');
            graphContainer.style.position = '';
            graphContainer.style.zIndex = '';
            graphContainer.style.width = '';
            graphContainer.style.height = '';
        } else {
            // Maximize the graph
            card.classList.add('maximized');
            document.body.classList.add('graph-maximized');
            maximizeBtn.classList.remove('bi-arrows-fullscreen');
            maximizeBtn.classList.add('bi-fullscreen-exit');
            graphContainer.style.position = 'fixed';
            graphContainer.style.zIndex = '1050';
            graphContainer.style.top = '0';
            graphContainer.style.left = '0';
            graphContainer.style.width = '100%';
            graphContainer.style.height = '100%';
            
            // Refresh the chart to fit the new container size
            const chartId = `graph-${graphId}`;
            const chart = Highcharts.charts.find(chart => chart && chart.renderTo.id === chartId);
            if (chart) {
                setTimeout(() => chart.reflow(), 100);
            }
        }
    }
    
    /**
     * Toggle collapse state of a graph
     */
    toggleGraphCollapse(graphId) {
        const graphContainer = document.querySelector(`.graph-container[data-graph-id="${graphId}"]`);
        if (!graphContainer) return;
        
        const graphBody = graphContainer.querySelector('.graph-body');
        const collapseBtn = graphContainer.querySelector('.collapse-graph-btn i');
        
        if (graphBody.style.display === 'none') {
            // Expand
            graphBody.style.display = '';
            collapseBtn.classList.remove('bi-plus');
            collapseBtn.classList.add('bi-dash');
        } else {
            // Collapse
            graphBody.style.display = 'none';
            collapseBtn.classList.remove('bi-dash');
            collapseBtn.classList.add('bi-plus');
        }
    }

    /**
     * Clear all graphs from the dashboard
     */
    clearAllGraphs() {
        if (this.graphs.length === 0) return;
        
        if (confirm('Are you sure you want to clear all graphs?')) {
            // Clear graphs array
            this.graphs = [];
            
            // Remove all graph containers
            const graphContainers = document.querySelectorAll('.graph-container');
            graphContainers.forEach(container => container.remove());
            
            // Show empty state
            this.elements.emptyState.style.display = '';
        }
    }

    /**
     * Save the current dashboard configuration as a JSON file
     * Includes connected server details for automatic loading
     */
    saveDashboard() {
        if (this.graphs.length === 0) {
            alert('No graphs to save. Add at least one graph to the dashboard.');
            return;
        }
        
        // Get the global selected servers information to save
        const globalServerDetails = {};
        this.selectedServers.forEach(serverName => {
            if (this.dhaServers[serverName]) {
                globalServerDetails[serverName] = this.dhaServers[serverName];
            }
        });
        
        // Create dashboard configuration object
        const dashboardConfig = {
            graphs: this.graphs,
            timestamp: new Date().toISOString(),
            globalServers: {
                selected: Array.from(this.selectedServers),
                details: globalServerDetails
            },
            selectedLayer: this.selectedLayer
        };
        
        // Convert to JSON string
        const jsonString = JSON.stringify(dashboardConfig, null, 2);
        
        // Create download link
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-config-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }

    /**
     * Load dashboard configuration from a file
     * Automatically loads saved server details and layer selection
     */
    loadDashboard(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const config = JSON.parse(e.target.result);
                
                // Validate configuration
                if (!config.graphs || !Array.isArray(config.graphs)) {
                    throw new Error('Invalid dashboard configuration');
                }
                
                // Clear existing graphs
                this.clearAllGraphs();
                
                // Reset server selections
                this.selectedServers.clear();
                const serverCheckboxes = document.querySelectorAll('.server-checkbox');
                serverCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                
                // Load saved server details if available
                // Check for new format (globalServers) first, then fall back to old format (servers)
                const serverConfig = config.globalServers || config.servers;
                
                if (serverConfig && serverConfig.selected && Array.isArray(serverConfig.selected)) {
                    console.log('Loading saved server selections...');
                    
                    // Update server details if provided
                    if (serverConfig.details) {
                        // Merge with existing server details, preserving current ones
                        Object.keys(serverConfig.details).forEach(serverName => {
                            if (!this.dhaServers[serverName]) {
                                this.dhaServers[serverName] = serverConfig.details[serverName];
                            }
                        });
                    }
                    
                    // Select the saved servers in the UI
                    serverConfig.selected.forEach(serverName => {
                        if (this.dhaServers[serverName]) {
                            // Check the corresponding checkbox
                            const checkbox = document.querySelector(`#server-${serverName}`);
                            if (checkbox) {
                                checkbox.checked = true;
                                this.selectServer(serverName);
                            }
                        }
                    });
                    
                    // Update "Select All" checkbox state
                    this.updateSelectAllState();
                    
                    // Test connections for selected servers
                    await this.testSelectedServers();
                }
                
                // Also load server details from individual graphs if available
                config.graphs.forEach(graphConfig => {
                    if (graphConfig.servers && graphConfig.servers.details) {
                        // Add any missing server details to the global dhaServers object
                        Object.keys(graphConfig.servers.details).forEach(serverName => {
                            if (!this.dhaServers[serverName]) {
                                this.dhaServers[serverName] = graphConfig.servers.details[serverName];
                            }
                        });
                    }
                });
                
                // Ensure we have connected servers before loading graphs
                if (!this.connectedServers || this.connectedServers.length === 0) {
                    // Find all connected servers to use
                    let connectedServers = [];
                    
                    console.log('Finding connected servers to load dashboard...');
                    
                    // Check each selected server for connectivity
                    for (const serverName of this.selectedServers) {
                        try {
                            // Use our server connectivity API to check if the server is connected
                            const isConnected = await this.testServerConnection(serverName);
                            
                            if (isConnected) {
                                console.log(`Server ${serverName} is connected and available`);
                                connectedServers.push(serverName);
                            } else {
                                console.log(`Server ${serverName} is not connected, skipping`);
                            }
                        } catch (error) {
                            console.warn(`Error checking connectivity for server ${serverName}:`, error);
                        }
                    }
                    
                    // If no connected servers were found, throw an error
                    if (connectedServers.length === 0) {
                        throw new Error('No connected servers found. Please select and connect to at least one server before loading a dashboard.');
                    }
                    
                    // Store the list of connected servers for later use when fetching data
                    this.connectedServers = connectedServers;
                }
                

                
                // Load saved layer selection if available
                if (config.selectedLayer && this.selectedServers.size > 0) {
                    console.log(`Loading saved layer selection: ${config.selectedLayer}`);
                    
                    // Set the layer select dropdown value
                    this.elements.layerSelect.value = config.selectedLayer;
                    
                    // Trigger layer selection to load fields
                    await this.handleLayerSelect(config.selectedLayer);
                }
                
                // Load graphs from configuration
                for (const graphConfig of config.graphs) {
                    // Ensure graph has an ID
                    if (!graphConfig.id) {
                        graphConfig.id = this.nextGraphId++;
                    } else {
                        // Update nextGraphId to be higher than any loaded ID
                        this.nextGraphId = Math.max(this.nextGraphId, graphConfig.id + 1);
                    }
                    
                    // Add to graphs array
                    this.graphs.push(graphConfig);
                    
                    // Render the graph
                    this.renderGraph(graphConfig);
                    
                    // Generate the chart with data
                    try {
                        await this.generateChart(graphConfig);
                    } catch (chartError) {
                        console.error(`Failed to generate chart for ${graphConfig.title}:`, chartError);
                        this.showMessage('error', `Failed to load data for chart "${graphConfig.title}". Please check server connections.`);
                    }
                }
                
                // Hide empty state if graphs were loaded
                if (this.graphs.length > 0) {
                    this.elements.emptyState.style.display = 'none';
                }
                
                // Reset file input
                e.target.value = '';
                
            } catch (error) {
                this.handleError('Failed to load dashboard configuration', error);
                this.showMessage('error', `Failed to load dashboard: ${error.message}`);
                e.target.value = '';
            }
        };
        
        reader.onerror = () => {
            this.handleError('Error reading file');
            e.target.value = '';
        };
        
        reader.readAsText(file);
    }

    /**
     * Handle errors
     */
    handleError(message, error) {
        showToast(message,'error');
        console.error(message, error);
        // In a production environment, you might want to show a toast or notification
    }
}

// Initialize the controller when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.graphController = new GraphController();
});