
import requests, os, json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from api.geo_server_config import GEOSERVER_CONFIG


DHA_CONFIGS = GEOSERVER_CONFIG['dha_servers']


def get_json_template(name, base_dir="response_templates"):
    path = os.path.join(base_dir, f"{name}.json")

    if not os.path.exists(path):
        return JsonResponse({"error": f"Template '{name}' not found"}, status=404)

    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return JsonResponse(data, safe=False)
    except json.JSONDecodeError:
        return JsonResponse({"error": f"Invalid JSON in '{name}.json'"}, status=500)

@csrf_exempt
def land_summary(request):

    # For Demo purposes only
    # return get_json_template("land_summary")


        
    STATION_URLS = {
        name.title(): f"http://{cfg['dhaip']}/geoserver/dha_coregis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dha_coregis%3Afinalreport&outputFormat=application%2Fjson&authkey={cfg['auth_key']}"
        for name, cfg in DHA_CONFIGS.items()
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

    # For Demo purposes only
    # return get_json_template("town_summary")

    # Build station URLs dynamically
    STATION_URLS = {
        name.title(): f"http://{cfg['dhaip']}/geoserver/dha_coregis_v2/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dha_coregis_v2%3Aphase_plot_category_summary&maxFeatures=50&outputFormat=application%2Fjson&authkey={cfg['auth_key']}"
        for name, cfg in DHA_CONFIGS.items()
    }

    CATEGORIES = ["Residential", "Commercial", "Education", "Amenities", "Parks", "Total_Plots"]
    result = {
        "total_summary": {cat: 0 for cat in CATEGORIES},
        "stations": []
    }

    def fetch_station_summary(station_name, url):
        """Fetch and summarize one station's data"""
        try:
            resp = requests.get(url, timeout=10)
            data = resp.json()

            station_summary = {}
            totals = {cat: 0 for cat in CATEGORIES}

            for feature in data.get("features", []):
                props = feature["properties"]
                phase = props.get("Phase", "").lower()
                category = props.get("Category", "").lower()
                count = int(props.get("Count_of_Plots", 0) or 0)
                total = int(props.get("Total_Plots", 0) or 0)

                # Normalize category
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

                if phase not in station_summary:
                    station_summary[phase] = {cat: 0 for cat in CATEGORIES}

                station_summary[phase][cat_key] += count
                station_summary[phase]["Total_Plots"] += total

                totals[cat_key] += count
                totals["Total_Plots"] += total

            return {
                "station_name": station_name,
                "phases": station_summary,
                "totals": totals
            }

        except Exception as e:
            print(f"[Error] {station_name}: {e}")
            return {
                "station_name": station_name,
                "error": str(e),
                "phases": {},
                "totals": {cat: 0 for cat in CATEGORIES}
            }

    # --- Parallel Execution of all station requests ---
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(fetch_station_summary, name, url): name for name, url in STATION_URLS.items()}

        for future in as_completed(futures):
            station_result = future.result()
            result["stations"].append(station_result)

            # Merge station totals into global totals
            for cat in CATEGORIES:
                result["total_summary"][cat] += station_result["totals"].get(cat, 0)

    result["timestamp"] = datetime.now().isoformat()
    return JsonResponse(result, safe=False, json_dumps_params={"indent": 2})

@csrf_exempt
def services_summary(request):
        
    # For Demo purposes only
    # return get_json_template("services_summary")
    """
    Fetch and summarize infrastructure service stats from all DHA stations.
    """
    # Build station URLs dynamically
    STATION_URLS = {
        name.title(): f"http://{cfg['dhaip']}/geoserver/dha_coregis_v2/ows"
                      f"?service=WFS&version=1.0.0&request=GetFeature"
                      f"&typeName=dha_coregis_v2%3Ainfrastructure_summary"
                      f"&maxFeatures=100&outputFormat=application%2Fjson"
                      f"&authkey={cfg['auth_key']}"
        for name, cfg in DHA_CONFIGS.items()
    }


    FIELD_MAP = {
        "Total Roads Planned (KM)": "Roads",
        "Total Daily Yield (GPD)": "Water Supply",
        "Total Electricity Production (KV)": "Electricity",
        "Total Gas Supply (BTU)": "Gas Supply",
        "Total Sewerage Lines (KM)": "Sewerage",
        "Total Drain Capacity": "Drainage",
        "Area Coverage (Kanals)": "Communication",
    }

    # --- Helpers ---
    def parse_float(val):
        try:
            if val is None:
                return 0.0
            if isinstance(val, str):
                val = val.replace(",", "").strip()
            return float(val)
        except Exception:
            return 0.0

    def summarize_geojson(station_name, url):
        """
        Fetch and summarize GeoJSON for one station.
        """
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()
            features = data.get("features", [])
            if not features:
                raise ValueError("No features found")

            summary = {}
            total_summary = {v: 0 for v in FIELD_MAP.values()}

            for feat in features:
                props = feat.get("properties", {})
                phase = str(props.get("Phase") or "Unknown").strip().lower()
                status = str(props.get("Status") or "Unknown").strip().title()

                if phase not in summary:
                    summary[phase] = {}

                if status not in summary[phase]:
                    summary[phase][status] = {v: 0 for v in FIELD_MAP.values()}

                for field, alias in FIELD_MAP.items():
                    val = parse_float(props.get(field))
                    summary[phase][status][alias] += val
                    total_summary[alias] += val

            # Phase totals
            phase_totals = {phase: {v: 0 for v in FIELD_MAP.values()} for phase in summary}
            for phase, statuses in summary.items():
                for status, metrics in statuses.items():
                    for k, v in metrics.items():
                        phase_totals[phase][k] += v

            return {
                "station_name": station_name,
                "success": True,
                "phase_wise": summary,
                "phase_totals": phase_totals,
                "totals": total_summary,
            }

        except Exception as e:
            return {
                "station_name": station_name,
                "success": False,
                "error": str(e),
                "phase_wise": {},
                "phase_totals": {},
                "totals": {v: 0 for v in FIELD_MAP.values()},
            }

    # --- Parallel execution ---
    results = []
    total_summary = {v: 0 for v in FIELD_MAP.values()}

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(summarize_geojson, name, url): name for name, url in STATION_URLS.items()}

        for future in as_completed(futures):
            result = future.result()
            results.append(result)

            # Merge into global totals if successful
            if result["success"]:
                for key in FIELD_MAP.values():
                    total_summary[key] += result["totals"].get(key, 0)

    final = {
        "total_summary": total_summary,
        "stations": results,
        "timestamp": datetime.now().isoformat(),
    }

    return JsonResponse(final, json_dumps_params={"indent": 2})

@csrf_exempt
def horticulture_summary(request):
            
    # For Demo purposes only
    # return get_json_template("horticulture_summary")
    """
    Fetch and summarize horticulture data (Polygon/Line/Point)
    for all DHA stations in parallel, including total and phase-wise values.
    """

    GEOMETRY_TYPES = {
        "Polygon": "Horticulture%20Polygon",
        "LineString": "Horticulture%20Line",
        "Points": "Horticulture%20Point",
    }

    # For mapping internal geometry to display-friendly names
    CATEGORY_MAP = {
        "Polygon": "Area_Kanals",
        "LineString": "Length_Km",
        "Points": "Points"
    }

    # Build URLs for each station and geometry type
    STATION_URLS = {
        name.title(): {
            geom: (
                f"http://{cfg['dhaip']}/geoserver/dha_coregis_v2/ows?"
                f"service=WFS&version=1.0.0&request=GetFeature&"
                f"typeName=dha_coregis_v2%3A{endpoint}"
                f"&maxFeatures=1000&outputFormat=application%2Fjson&authkey={cfg['auth_key']}"
            )
            for geom, endpoint in GEOMETRY_TYPES.items()
        }
        for name, cfg in DHA_CONFIGS.items()
    }

    result = {
        "total_summary": {"Area_Kanals": 0.0, "Length_Km": 0.0, "Points": 0},
        "stations": []
    }

    def fetch_station_data(station_name, urls):
        """Fetch horticulture data and summarize phase-wise + station totals."""
        station_totals = {"Area_Kanals": 0.0, "Length_Km": 0.0, "Points": 0}
        phase_summary = {}

        for geom_type, url in urls.items():
            try:
                resp = requests.get(url, timeout=10)
                data = resp.json()
                features = data.get("features", [])

                value_field = None
                if geom_type == "Polygon":
                    value_field = "Area_Kanals"
                elif geom_type == "LineString":
                    value_field = "Length_Km"

                for f in features:
                    props = f.get("properties", {})
                    phase = props.get("Phase", "").lower().strip() or "unknown"

                    # Initialize phase
                    if phase not in phase_summary:
                        phase_summary[phase] = {
                            "Area_Kanals": 0.0,
                            "Length_Km": 0.0,
                            "Points": 0
                        }

                    if geom_type == "Polygon":
                        val = float(props.get(value_field, 0) or 0)
                        phase_summary[phase]["Area_Kanals"] += val
                        station_totals["Area_Kanals"] += val

                    elif geom_type == "LineString":
                        val = float(props.get(value_field, 0) or 0)
                        phase_summary[phase]["Length_Km"] += val
                        station_totals["Length_Km"] += val

                    elif geom_type == "Points":
                        phase_summary[phase]["Points"] += 1
                        station_totals["Points"] += 1

            except Exception as e:
                print(f"⚠️ Error fetching {geom_type} for {station_name}: {e}")

        return {
            "station_name": station_name,
            "summary": station_totals,
            "phases": phase_summary
        }

    # Threaded fetching
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [
            executor.submit(fetch_station_data, station_name, urls)
            for station_name, urls in STATION_URLS.items()
        ]
        for f in as_completed(futures):
            station_data = f.result()
            result["stations"].append(station_data)

            # Add to overall totals
            result["total_summary"]["Area_Kanals"] += station_data["summary"]["Area_Kanals"]
            result["total_summary"]["Length_Km"] += station_data["summary"]["Length_Km"]
            result["total_summary"]["Points"] += station_data["summary"]["Points"]

    result["timestamp"] = datetime.now().isoformat()

    return JsonResponse(result, safe=False, json_dumps_params={"indent": 2})

@csrf_exempt
def security_summary(request):
                
    # For Demo purposes only
    # return get_json_template("security_summary")
    CATEGORIES = ["Camera", "Check Post", "Picquet", "QRF", "Incidents"]

    STATION_URLS = {
        name.title(): f"http://{cfg['dhaip']}/geoserver/dha_coregis_v2/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dha_coregis_v2%3Aphase_security_summary&maxFeatures=50&outputFormat=application%2Fjson&authkey={cfg['auth_key']}"
        for name, cfg in DHA_CONFIGS.items()
    }

    result = {
        "total_summary": {cat: 0 for cat in CATEGORIES},
        "stations": []
    }

    def fetch_station(station_name, url):
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

                if category not in CATEGORIES:
                    continue

                if phase not in phase_summary:
                    phase_summary[phase] = {cat: 0 for cat in CATEGORIES}
                    phase_summary[phase]["Total_Features"] = 0

                phase_summary[phase][category] += count
                phase_summary[phase]["Total_Features"] += total

                station_summary[category] = station_summary.get(category, 0) + count
                station_summary["Total_Features"] = station_summary.get("Total_Features", 0) + total

            return {
                "station_name": station_name,
                "totals": station_summary,
                "phases": phase_summary
            }

        except Exception as e:
            print(f"Failed to fetch {station_name}: {e}")
            return None

    # Run parallel fetching
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(fetch_station, name, url) for name, url in STATION_URLS.items()]
        for future in as_completed(futures):
            station_data = future.result()
            if station_data:
                result["stations"].append(station_data)
                for cat, val in station_data["totals"].items():
                    if cat in result["total_summary"]:
                        result["total_summary"][cat] += val

    result["timestamp"] = datetime.now().isoformat()
    return JsonResponse(result, safe=False, json_dumps_params={"indent": 2})