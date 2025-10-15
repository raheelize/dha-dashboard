import json
import os
import logging
import requests
from django.http import JsonResponse,HttpResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .geo_server_config import GEOSERVER_CONFIG

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def proxy_geoserver(request):
    base_url = request.GET.get("url")
    if not base_url:
        return JsonResponse({"error": "Missing 'url' parameter"}, status=400)

    try:
        # Remove 'url' from params before forwarding
        params = request.GET.dict()
        params.pop("url", None)

        # Forward request to GeoServer
        response = requests.get(base_url, params=params, timeout=20)

        return HttpResponse(
            response.content,
            status=response.status_code,
            content_type=response.headers.get("Content-Type", "application/json"),
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# Remove login_required to facilitate testing
@csrf_exempt
@require_http_methods(["GET"])
def get_dha_servers(request):
    """Return the configuration of available DHA servers from the config file."""
    try:

        config = GEOSERVER_CONFIG
        
        if 'dha_servers' not in config:
            logger.error('No DHA servers found in config')
            return JsonResponse({'error': 'No DHA servers found in config'}, status=404)
        
        logger.info(f'DHA servers loaded successfully: {config["dha_servers"]}')
        return JsonResponse(config["dha_servers"])
    except Exception as e:
        logger.error(f'Error loading DHA servers: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET", "POST"])
def check_server_connectivity(request):
    """Check connectivity to a specific DHA server."""
    try:
        server_name = request.GET.get('server')


        config = GEOSERVER_CONFIG
        
        if 'dha_servers' not in config or server_name not in config['dha_servers']:
            logger.error(f'Server {server_name} not found in config')
            return JsonResponse({'error': f'Server {server_name} not found in config'}, status=404)
        
        server_details = config['dha_servers'][server_name]
        server_ip = server_details.get('dhaip')
        auth_key = server_details.get('auth_key')
        
        logger.info(f'Server details: {server_details}')
        
        # Attempt to connect to the server
        try:
            # Construct a test URL to the GeoServer capabilities endpoint
            workspace = 'dha_coregis'
            test_url = f'http://{server_ip}/geoserver/{workspace}/wfs?service=WFS&version=2.0.0&request=GetCapabilities&authkey={auth_key}'
            
            # Log the URL for debugging purposes (without the auth key for security)
            safe_url = f'http://{server_ip}/geoserver/{workspace}/wfs?service=WFS&version=2.0.0&request=GetCapabilities&authkey=REDACTED'
            logger.info(f'Testing connection to: {safe_url}')
            
            # Set a short timeout to avoid long waits
            response = requests.get(
                test_url, 
                headers={
                    'Accept': 'application/xml',
                    'Content-Type': 'application/xml'
                }, 
                timeout=5
            )
            
            logger.info(f'Connection test result for {server_name}: Status {response.status_code}')
            
            if response.status_code in [200, 201]:
                return JsonResponse({
                    'server': server_name,
                    'status': 'connected',
                    'message': 'Successfully connected to server',
                    'details': {
                        'dhaip': server_details.get('dhaip'),
                        'test_url': safe_url
                    }
                })
            else:
                logger.warning(f'Server {server_name} returned error status: {response.status_code}')
                logger.warning(f'Response content: {response.text[:200]}...')
                return JsonResponse({
                    'server': server_name,
                    'status': 'error',
                    'message': f'Server returned status code: {response.status_code}',
                    'details': {
                        'dhaip': server_details.get('dhaip'),
                        'test_url': safe_url
                    }
                })
                
        except requests.exceptions.RequestException as e:
            logger.warning(f'Connection to {server_name} failed: {str(e)}')
            return JsonResponse({
                'server': server_name,
                'status': 'disconnected',
                'message': f'Could not connect to server: {str(e)}',
                'details': server_details
            })
            
    except Exception as e:
        logger.error(f'Error checking server connectivity: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)