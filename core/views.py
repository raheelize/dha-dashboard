from django.shortcuts import render,redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib import messages


def login_view(request):
    # If user is already logged in, send them straight to dashboard
    if request.user.is_authenticated:
        return redirect('land')

    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()
        remember_me = request.POST.get('remember_me')

        if not username or not password:
            messages.error(request, "Please enter both username and password.")
        else:
            user = authenticate(request, username=username, password=password)
            if user is not None:
                auth_login(request, user)

                 # Handle remember me
                if not remember_me:
                    request.session.set_expiry(0)  # expires on browser close
                else:
                    request.session.set_expiry(60 * 60 * 24 * 30)  # 30 days


                messages.success(request, f"Welcome back, {user.username}!")
                return redirect('land')
            else:
                messages.error(request, "Invalid username or password.")

    return render(request, 'login.html')

@login_required(login_url='login')
def logout_view(request):
    auth_logout(request)
    messages.info(request, "You’ve been logged out successfully.")
    return redirect('login')




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

