from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    path('', views.land, name='land'),
    path('land/', views.land, name='land'),

    
    path('townplan/', views.townplan, name='townplan'),
    path('map/', views.map_view, name='map'),
]

