from django.shortcuts import render,redirect
from django.contrib.auth.decorators import login_required
# from django.contrib.auth import authenticate, login as auth_login


def login_view(request):

    # message = ""
    context = {}
    # if request.method == 'POST':
    #     username = request.POST.get('username')
    #     password = request.POST.get('password')
    #     user = authenticate(request, username=username, password=password)
    #     if user is not None:
    #         auth_login(request, user)
    #         return redirect('dashboard')
    #     else:
    #         message = "Invalid Crednetials"


    # if message:
    #     context['message'] = message
    return render(request, 'login.html', context)



@login_required(login_url='/login/')
def dashboard(request):
    context = {'dashboard_number': 1}
    return render(request, 'dashboard.html',context)


@login_required(login_url='/login/')
def land(request):
    context = {'dashboard_number': 2}
    return render(request, 'land.html',context)


@login_required(login_url='/login/')
def townplan(request):
    context = {'dashboard_number': 2}
    return render(request, 'townplan.html',context)

@login_required(login_url='/login/')
def map_view(request):
    return render(request, 'map.html')

