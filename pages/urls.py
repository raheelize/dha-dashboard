from django.urls import path
from . import views

from django.views.decorators.cache import cache_page
from django.views.generic import RedirectView

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    path('', RedirectView.as_view(pattern_name='land', permanent=False)),

    path('land/', views.land, name='land'),
    path('townplan/', views.townplan, name='townplan'),
    path('cheif_engineering/', views.cheif_engineering, name='cheif_engineering'),
    path('horticulture/', views.horticulture, name='horticulture'),
    path('security/', views.security, name='security'),
    path('corgis/', views.coregis, name='coregis'),
    path('query-engine/', views.query_engine, name='query_engine'),
]

