from django.urls import path
from . import views

# from django.views.decorators.cache import cache_page
# from django.views.generic import RedirectView

urlpatterns = [

    path('land-summary/', views.land_summary, name='land_summary'),    
    path('town-summary/', views.town_summary, name='town_summary'),  
    path('security-summary/', views.security_summary, name='security_summary'),  
]

