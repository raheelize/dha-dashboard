from django.urls import path
from . import views

from django.views.decorators.cache import cache_page
# from django.views.generic import RedirectView

from .dha_servers import get_dha_servers, check_server_connectivity,proxy_geoserver
from .config_api import get_geoserver_config, get_allowed_fields, filter_layer_fields

urlpatterns = [


    # Summary Views
    path('land-summary/', cache_page(60 * 30)(views.land_summary), name='land_summary'),    
    path('town-summary/', cache_page(60 * 30)(views.town_summary), name='town_summary'),  
    path('services-summary/', cache_page(60 * 30)(views.services_summary), name='services_summary'),
    path('horticulture-summary/', cache_page(60 * 30)(views.horticulture_summary), name='horticulture_summary'), 
    path('security-summary/', cache_page(60 * 30)(views.security_summary), name='security_summary'), 


    # Query Engine APIs
    # path('dha/servers',cache_page(60 * 30)(get_dha_servers), name='api_dha_servers'),
    # path('dha/server/check',cache_page(60 * 30)(check_server_connectivity), name='api_check_server_connectivity'),
    # path('config/geoserver',cache_page(60 * 30)(get_geoserver_config), name='api_geoserver_config'),
    # path('config/allowed-fields',cache_page(60 * 30)(get_allowed_fields), name='api_allowed_fields'),
    # path('config/filter-fields',cache_page(60 * 30)(filter_layer_fields), name='api_filter_fields'),

    path('dha/servers',get_dha_servers, name='api_dha_servers'),
    path('dha/server/check',check_server_connectivity, name='api_check_server_connectivity'),
    path('config/geoserver',get_geoserver_config, name='api_geoserver_config'),
    path('config/allowed-fields',get_allowed_fields, name='api_allowed_fields'),
    path('config/filter-fields',filter_layer_fields, name='api_filter_fields'),
    path("proxy/geoserver/", proxy_geoserver, name="proxy_geoserver"),
]

