from django.urls import path
from . import views

from django.views.decorators.cache import cache_page
# from django.views.generic import RedirectView

urlpatterns = [

    path('land-summary/', cache_page(60 * 30)(views.land_summary), name='land_summary'),    
    path('town-summary/', cache_page(60 * 30)(views.town_summary), name='town_summary'),  
    path('services-summary/', cache_page(60 * 30)(views.services_summary), name='services_summary'),
    path('horticulture-summary/', cache_page(60 * 30)(views.horticulture_summary), name='horticulture_summary'), 
    path('security-summary/', cache_page(60 * 30)(views.security_summary), name='security_summary'),  
]

