class ConfigLoader {
    static async loadConfig() {
        try {
            console.log('Fetching configuration from /api/config/geoserver');
            const response = await fetch('/api/config/geoserver');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
            }
            
            const config = await response.json();
            console.log('Configuration loaded successfully:', config);
            return config;
        } catch (error) {
            console.error('Error loading configuration:', error);
            throw error;
        }
    }

    static async getDHAServers() {
        try {
            console.log('Getting DHA servers');
            const config = await this.loadConfig();
            
            if (!config || !config.dha_servers) {
                console.error('No DHA servers found in config:', config);
                return {};
            }
            
            console.log('DHA servers loaded:', config.dha_servers);
            return config.dha_servers;
        } catch (error) {
            console.error('Error getting DHA servers:', error);
            return {};
        }
    }

    static async getQueryEngineLayers() {
        try {
            console.log('Getting query engine layers');
            const config = await this.loadConfig();
            
            if (!config || !config.query_engine_layers) {
                console.error('No query engine layers found in config:', config);
                return [];
            }
            
            console.log('Query engine layers loaded:', config.query_engine_layers);
            
            // Return the structured layers object directly
            // The structure can be either the new format with groups and flat arrays
            // or the legacy format (simple array)
            return config.query_engine_layers;
        } catch (error) {
            console.error('Error getting query engine layers:', error);
            return [];
        }
    }
}