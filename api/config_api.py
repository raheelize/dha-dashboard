import json
import os
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
logger = logging.getLogger(__name__)
from .geo_server_config import GEOSERVER_CONFIG


@csrf_exempt
def get_geoserver_config(request):
    
    return JsonResponse(GEOSERVER_CONFIG)

@csrf_exempt
def get_allowed_fields(request):
    """
    Return the list of allowed fields for query_engine/graph dropdowns
    """
    try:
        config = GEOSERVER_CONFIG
        allowed_fields = config.get('allowed_fields', [])
        logger.info(f'Allowed fields loaded: {allowed_fields}')
        
        return JsonResponse({
            'allowed_fields': allowed_fields
        })
    except Exception as e:
        logger.error(f'Error getting allowed fields: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def filter_layer_fields(request):
    """
    Filter a list of field objects to only include those in allowed_fields from geoserver_config.json
    
    Expected request format: 
    {
        "fields": [
            {"name": "field1", "type": "numeric"},
            {"name": "field2", "type": "text"},
            ...
        ]
    }
    """
    try:
        logger.info('filter_layer_fields called')
        if request.method != 'POST':
            return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
            
        import json
        data = json.loads(request.body)
        
        if 'fields' not in data:
            return JsonResponse({'error': 'Missing fields parameter'}, status=400)

        config = GEOSERVER_CONFIG
        
        allowed_fields = config.get('allowed_fields', [])
        logger.info(f'Allowed fields loaded: {allowed_fields}')
            
        all_fields = data['fields']
        
        # Filter fields to only include those in the allowed_fields list (case-insensitive)
        allowed_fields_lower = [field.lower() for field in allowed_fields]
        filtered_fields = [field for field in all_fields if field['name'].lower() in allowed_fields_lower]
        
        return JsonResponse({
            'filtered_fields': filtered_fields
        })
    except Exception as e:
        logger.error(f'Error filtering fields: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)