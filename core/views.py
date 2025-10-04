from django.shortcuts import render

def login_view(request):
    return render(request, 'login.html')

def dashboard1(request):
    context = {'dashboard_number': 1}
    return render(request, 'dashboard.html',context)

def dashboard2(request):
    context = {'dashboard_number': 2}
    return render(request, 'dashboard.html',context)

def dashboard3(request):
    context = {'dashboard_number': 2}
    return render(request, 'dashboard.html',context)


def map_view(request):
    return render(request, 'map.html')
