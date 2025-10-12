
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime

from concurrent.futures import ThreadPoolExecutor, as_completed

from api.geo_server_config import GEOSERVER_CONFIG
dha_configs = GEOSERVER_CONFIG['dha_servers']


@csrf_exempt
def land_summary(request):
        
    STATION_URLS = {
        name.title(): f"http://{cfg['dhaip']}/geoserver/dha_coregis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dha_coregis%3Afinalreport&outputFormat=application%2Fjson&authkey={cfg['auth_key']}"
        for name, cfg in dha_configs.items()
    }



    print(f"[{datetime.now()}] Consolidated DHA Report API started")

    totals = {
        "possessed": 0,
        "unpossessed": 0,
        "purchased": 0,
        "unpurchased": 0,
        "hold": 0,
        "litigation": 0,
    }

    stations_summary = []

    def fetch_station_data(station_name, url):
        """Thread worker: fetch + process one station"""
        print(f"Fetching data for {station_name}...")
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()
            features = data.get("features", [])
            if not features:
                print(f"{station_name}: No features found in GeoJSON.")
                return {
                    "station_name": station_name,
                    "totals": {k: 0 for k in totals},
                    "phase_summary": {},
                    "land_provider_summary": {},
                }

            # Initialize summaries
            station_totals = {k: 0 for k in totals}
            phase_summary = {}
            land_provider_summary = {}

            for feature in features:
                props = feature.get("properties", {})
                total_area = props.get("totalarea") or 0
                purchased = props.get("purchasedarea") or 0
                possessed = props.get("totalpossessedland") or 0
                unpossessed = props.get("totalunpossessedland") or 0
                hold = props.get("totalholdland") or 0
                litigation = props.get("totallitigationland") or 0
                unpurchased = total_area - purchased if total_area else 0

                phase = str(props.get("phase") or props.get("phase_name") or "Unknown").title()
                land_provider = str(props.get("land_provider") or props.get("provider") or "Unknown").title()

                # Phase summary
                if phase not in phase_summary:
                    phase_summary[phase] = {k: 0 for k in totals}
                phase_summary[phase]["purchased"] += purchased
                phase_summary[phase]["unpurchased"] += unpurchased
                phase_summary[phase]["possessed"] += possessed
                phase_summary[phase]["unpossessed"] += unpossessed
                phase_summary[phase]["hold"] += hold
                phase_summary[phase]["litigation"] += litigation

                # Land provider summary
                if land_provider not in land_provider_summary:
                    land_provider_summary[land_provider] = {k: 0 for k in totals}
                land_provider_summary[land_provider]["purchased"] += purchased
                land_provider_summary[land_provider]["unpurchased"] += unpurchased
                land_provider_summary[land_provider]["possessed"] += possessed
                land_provider_summary[land_provider]["unpossessed"] += unpossessed
                land_provider_summary[land_provider]["hold"] += hold
                land_provider_summary[land_provider]["litigation"] += litigation

                # Station totals
                station_totals["possessed"] += possessed
                station_totals["unpossessed"] += unpossessed
                station_totals["purchased"] += purchased
                station_totals["unpurchased"] += unpurchased
                station_totals["hold"] += hold
                station_totals["litigation"] += litigation

            print(f"{station_name}: Processed {len(features)} features successfully.")
            return {
                "station_name": station_name,
                "totals": {k: round(v, 3) for k, v in station_totals.items()},
                "phase_summary": {
                    p: {k: round(v, 3) for k, v in vals.items()}
                    for p, vals in phase_summary.items()
                },
                "land_provider_summary": {
                    lp: {k: round(v, 3) for k, v in vals.items()}
                    for lp, vals in land_provider_summary.items()
                },
            }

        except Exception as e:
            print(f"Error fetching data for {station_name}: {e}")
            return {
                "station_name": station_name,
                "error": str(e),
                "totals": {k: 0 for k in totals},
                "phase_summary": {},
                "land_provider_summary": {},
            }

    # --- Run fetches in parallel ---
    MAX_THREADS = min(10, len(STATION_URLS))
    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        future_to_station = {
            executor.submit(fetch_station_data, name, url): name
            for name, url in STATION_URLS.items()
        }

        for future in as_completed(future_to_station):
            result = future.result()
            stations_summary.append(result)
            if "error" not in result:
                for k in totals:
                    totals[k] += result["totals"][k]

    # --- Combine final result ---
    response_payload = {
        "total_summary": {f"total_{k}": round(v, 3) for k, v in totals.items()},
        "stations": stations_summary,
        "timestamp": datetime.now().isoformat(),
    }

    print(f"[{datetime.now()}] Consolidated DHA Report API completed")
    return JsonResponse(response_payload, safe=False, json_dumps_params={"indent": 2})




@csrf_exempt
def town_summary(request):
    
    
    STATION_URLS = {
        name.title(): f"http://{cfg['dhaip']}/geoserver/dha_coregis_v2/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dha_coregis_v2%3Aphase_plot_category_summary&maxFeatures=50&outputFormat=application%2Fjson&authkey={cfg['auth_key']}"
        for name, cfg in dha_configs.items()
    }
    
    result = {
        "total_summary": {
            "Residential": 0,
            "Commercial": 0,
            "Education": 0,
            "Amenities": 0,
            "Parks": 0,
            "Total_Plots": 0
        },
        "stations": []
    }

    for station_name, url in STATION_URLS.items():

        try:
            resp = requests.get(url, timeout=10)
            data = resp.json()

            station_summary = {}
            totals = {
                "Residential": 0,
                "Commercial": 0,
                "Education": 0,
                "Amenities": 0,
                "Parks": 0,
                "Total_Plots": 0
            }

            for feature in data.get("features", []):
                props = feature["properties"]
                phase = props.get("Phase", "").lower()
                category = props.get("Category", "").lower()
                count = int(props.get("Count_of_Plots", 0) or 0)
                total = int(props.get("Total_Plots", 0) or 0)

                # Normalize category name
                if "residential" in category:
                    cat_key = "Residential"
                elif "commercial" in category:
                    cat_key = "Commercial"
                elif "education" in category:
                    cat_key = "Education"
                elif "amen" in category:
                    cat_key = "Amenities"
                elif "park" in category:
                    cat_key = "Parks"
                else:
                    continue

                # Initialize phase if not exists
                if phase not in station_summary:
                    station_summary[phase] = {
                        "Residential": 0,
                        "Commercial": 0,
                        "Education": 0,
                        "Amenities": 0,
                        "Parks": 0,
                        "Total_Plots": 0
                    }

                # Update per-phase counts
                station_summary[phase][cat_key] += count
                station_summary[phase]["Total_Plots"] += total

                # Update totals across all phases
                totals[cat_key] += count
                totals["Total_Plots"] += total

                # Update global totals as before
                result["total_summary"][cat_key] += count
                result["total_summary"]["Total_Plots"] += total

            # Add this station’s data to results
            result["stations"].append({
                "station_name": station_name,
                "phases": station_summary,
                "totals": totals
            })

        except Exception as e:
            print(f"Error fetching {station_name}: {e}")

    result["timestamp"] = datetime.now().isoformat()
    
    return JsonResponse(result, safe=False, json_dumps_params={"indent": 2})





@csrf_exempt
def security_summary(request):
    
    
    STATION_URLS = {
        name.title(): f"http://{cfg['dhaip']}/geoserver/dha_coregis_v2/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dha_coregis_v2%3Aphase_security_summary&maxFeatures=50&outputFormat=application%2Fjson&authkey={cfg['auth_key']}"
        for name, cfg in dha_configs.items()
    }

    CATEGORIES = ["Camera", "Check Post", "Picquet", "QRF", "Incidents"]
    
    result = {
        "total_summary": {cat: 0 for cat in CATEGORIES},
        "stations": []
    }

    for station_name, url in STATION_URLS.items():
        try:
            resp = requests.get(url, timeout=10)
            data = resp.json()

            station_summary = {}
            phase_summary = {}

            for feature in data.get("features", []):
                props = feature.get("properties", {})
                phase = props.get("Phase", "").lower()
                category = props.get("Category", "")
                count = props.get("Count_of_Features", 0)
                total = props.get("Total_Features", 0)

                # Normalize missing/extra categories
                if category not in CATEGORIES:
                    continue

                # Initialize phase if needed
                if phase not in phase_summary:
                    phase_summary[phase] = {cat: 0 for cat in CATEGORIES}
                    phase_summary[phase]["Total_Features"] = 0

                # Update counts
                phase_summary[phase][category] += count
                phase_summary[phase]["Total_Features"] += total

                # Update station-level total
                station_summary[category] = station_summary.get(category, 0) + count
                station_summary["Total_Features"] = station_summary.get("Total_Features", 0) + total

                # Update global total
                result["total_summary"][category] += count

            result["stations"].append({
                "station_name": station_name,
                "totals": station_summary,
                "phases": phase_summary
            })

        except Exception as e:
            print(f"⚠️ Failed to fetch {station_name}: {e}")

    result["timestamp"] = datetime.now().isoformat()
    
    return JsonResponse(result, safe=False, json_dumps_params={"indent": 2})
