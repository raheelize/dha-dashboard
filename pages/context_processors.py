from api.geo_server_config import GEOSERVER_CONFIG

def global_dha_servers(request):
    dha_servers = GEOSERVER_CONFIG.get("dha_servers", {})
    
    # Prepare both the full dict + each city as an individual key
    # context = {"DHA_SERVERS": dha_servers}

    context = {}

    # Add name-wise keys for easier access
    for name, data in dha_servers.items():
        context[f'IP_{name}'] = data['dhaip']  # e.g., DHA_KARACHI, DHA_LAHORE

    return context
