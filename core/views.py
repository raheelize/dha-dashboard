from django.shortcuts import render
import json

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
     # Dummy complex polygons (lat, lng). Approximate, for demo only.
    polygons = [
        {
            "name": "Karachi (complex area)",
            "coords": [
                [24.98, 66.87],
                [24.95, 66.98],
                [24.86, 67.03],
                [24.70, 67.00],
                [24.60, 66.95],
                [24.75, 66.78],
                [24.90, 66.75],
                [24.98, 66.87]
            ],
            "style": {"color": "#0b6efd", "fillColor": "#0b6efd", "fillOpacity": 0.28}
        },
        {
            "name": "Lahore (complex)",
            "coords": [
                [31.72, 74.18],
                [31.77, 74.36],
                [31.65, 74.45],
                [31.55, 74.50],
                [31.42, 74.45],
                [31.36, 74.29],
                [31.45, 74.15],
                [31.60, 74.10],
                [31.72, 74.18]
            ],
            "style": {"color": "#28a745", "fillColor": "#28a745", "fillOpacity": 0.25}
        },
        {
            "name": "Islamabad / Margalla region",
            "coords": [
                [33.76, 73.01],
                [33.77, 73.08],
                [33.75, 73.14],
                [33.70, 73.16],
                [33.66, 73.10],
                [33.67, 72.99],
                [33.72, 72.94],
                [33.76, 73.01]
            ],
            "style": {"color": "#fd7e14", "fillColor": "#fd7e14", "fillOpacity": 0.30}
        },
        {
            "name": "Peshawar area",
            "coords": [
                [34.15, 71.45],
                [34.12, 71.62],
                [34.05, 71.74],
                [33.95, 71.78],
                [33.85, 71.66],
                [33.90, 71.48],
                [34.02, 71.45],
                [34.15, 71.45]
            ],
            "style": {"color": "#6f42c1", "fillColor": "#6f42c1", "fillOpacity": 0.22}
        },
        {
            "name": "Quetta / Bolan region",
            "coords": [
                [30.32, 66.85],
                [30.28, 67.10],
                [30.20, 67.28],
                [30.05, 67.25],
                [29.98, 67.05],
                [30.05, 66.85],
                [30.20, 66.80],
                [30.32, 66.85]
            ],
            "style": {"color": "#dc3545", "fillColor": "#dc3545", "fillOpacity": 0.26}
        },
        {
            "name": "Gilgit-Baltistan (large mountainous area)",
            "coords": [
                [36.10, 74.50],
                [35.85, 74.90],
                [35.50, 75.30],
                [35.00, 75.00],
                [34.60, 74.50],
                [34.80, 73.80],
                [35.30, 73.50],
                [35.90, 73.70],
                [36.10, 74.50]
            ],
            "style": {"color": "#20c997", "fillColor": "#20c997", "fillOpacity": 0.18}
        }
    ]

    return render(request, 'map.html', {
        "polygons_json": json.dumps(polygons)
    })
