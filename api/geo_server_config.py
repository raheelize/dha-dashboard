from decouple import config

GEOSERVER_CONFIG = {
    "dha_servers": {
        "multan": {
            "dhaip": config("MULTAN_DHAIP", default=""),
            "auth_key": config("MULTAN_AUTH_KEY", default="")
        },
        "lahore": {
            "dhaip": config("LAHORE_DHAIP", default=""),
            "auth_key": config("LAHORE_AUTH_KEY", default="")
        },
        "gujranwala": {
            "dhaip": config("GUJRANWALA_DHAIP", default=""),
            "auth_key": config("GUJRANWALA_AUTH_KEY", default="")
        },
        "karachi": {
            "dhaip": config("KARACHI_DHAIP", default=""),
            "auth_key": config("KARACHI_AUTH_KEY", default="")
        },
        "karachi_city": {
            "dhaip": config("KARACHI_CITY_DHAIP", default=""),
            "auth_key": config("KARACHI_CITY_AUTH_KEY", default="")
        },
        "islamabad": {
            "dhaip": config("ISLAMABAD_DHAIP", default=""),
            "auth_key": config("ISLAMABAD_AUTH_KEY", default="")
        },
        "quetta": {
            "dhaip": config("QUETTA_DHAIP", default=""),
            "auth_key": config("QUETTA_AUTH_KEY", default="")
        },
        "bahawalpur": {
            "dhaip": config("BAHAWALPUR_DHAIP", default=""),
            "auth_key": config("BAHAWALPUR_AUTH_KEY", default="")
        },
        "peshawar": {
            "dhaip": config("PESHAWAR_DHAIP", default=""),
            "auth_key": config("PESHAWAR_AUTH_KEY", default="")
        },
    },
    "query_engine_layers": {
        "groups": [
            {
                "name": "Chief Engineer",
                "layers": [
                    {
                        "id": "dem_countours",
                        "label": "DEM Contours"
                    },
                    {
                        "id": "electric_utility",
                        "label": "Electric Utility Points"
                    },
                    {
                        "id": "electric_utility_line",
                        "label": "Electric Utility Lines"
                    },
                    {
                        "id": "gas_utiility",
                        "label": "Gas Utility Points"
                    },
                    {
                        "id": "gas_utility_line",
                        "label": "Gas Utility Lines"
                    },
                    {
                        "id": "pois",
                        "label": "Point of Intrests"
                    },
                    {
                        "id": "revenue_projects",
                        "label": "Revenue Projects"
                    },
                    {
                        "id": "sewerage_line",
                        "label": "Sewerage Lines"
                    },
                    {
                        "id": "strom_drains",
                        "label": "Storm Drains"
                    },
                    {
                        "id": "telcom_utility",
                        "label": "Telecom Utility Points"
                    },
                    {
                        "id": "telcom_utility_line",
                        "label": "Telecom Utility Lines"
                    },
                    {
                        "id": "water_utility",
                        "label": "Water Utility Points"
                    },
                    {
                        "id": "water_utility_line",
                        "label": "Water Utility Lines"
                    }
                ]
            },
            {
                "name": "Horticuluture",
                "layers": [
                    {
                        "id": "horticulture_line",
                        "label": "Horticulture Lines"
                    },
                    {
                        "id": "horticulture_point",
                        "label": "Horticulture Points"
                    },
                    {
                        "id": "horticulture_polygon",
                        "label": "Horticulture Areas"
                    }
                ]
            },
            {
                "name": "Land Acquisition",
                "layers": [
                    {
                        "id": "purchase_layer",
                        "label": "Purchase Layer"
                    }
                ]
            },
            {
                "name": "Revenue Boundaries",
                "layers": [
                    {
                        "id": "acre",
                        "label": "Acre Biybdart"
                    },
                    {
                        "id": "district",
                        "label": "District Boundary"
                    },
                    {
                        "id": "dte_land_khasra",
                        "label": "Khasra Boundary"
                    },
                    {
                        "id": "dte_land_mauza",
                        "label": "Mauza Boundary"
                    },
                    {
                        "id": "marraba",
                        "label": "Marraba Boundary"
                    },
                    {
                        "id": "tehsil",
                        "label": "Tehsil Boundary"
                    }
                ]
            },
            {
                "name": "Security",
                "layers": [
                    {
                        "id": "camera",
                        "label": "Cameras"
                    },
                    {
                        "id": "check post",
                        "label": "Check Posts"
                    },
                    {
                        "id": "incidents",
                        "label": "Incidents"
                    },
                    {
                        "id": "picquets",
                        "label": "Picquets"
                    },
                    {
                        "id": "qrf",
                        "label": "QRF"
                    }
                ]
            },
            {
                "name": "Summaries",
                "layers": [
                    {
                        "id": "finalreport",
                        "label": "Purchase Land Summary"
                    },
                    {
                        "id": "graphdatalandcat",
                        "label": "Purchase Land Summary High Level"
                    },
                    {
                        "id": "plot_summary",
                        "label": "Plot Summary"
                    }
                ]
            },
            {
                "name": "Town Plan",
                "layers": [
                    {
                        "id": "dte_land_phase",
                        "label": "Phase Boundary"
                    },
                    {
                        "id": "plot_boundary",
                        "label": "Plot Boundary"
                    },
                    {
                        "id": "project_boundary",
                        "label": "Project Boundary"
                    },
                    {
                        "id": "roads",
                        "label": "Roads"
                    },
                    {
                        "id": "sector_boundary",
                        "label": "Sector Boundary"
                    },
                    {
                        "id": "block_boundary",
                        "label": "Block Boundary"
                    }
                ]
            }
        ],
        "flat": [
            "acre",
            "block_boundary",
            "camera",
            "check post",
            "dem_countours",
            "district",
            "dte_land_khasra",
            "dte_land_mauza",
            "dte_land_phase",
            "electric_utility",
            "electric_utility_line",
            "finalreport",
            "gas_utiility",
            "gas_utility_line",
            "graphdatalandcat",
            "horticulture_line",
            "horticulture_point",
            "horticulture_polygon",
            "incidents",
            "khasrafeatureinfo",
            "land_offer_form",
            "marraba",
            "picquets",
            "plot_boundary",
            "plot_summary",
            "pois",
            "project_boundary",
            "purchase_layer",
            "qrf",
            "revenue_projects",
            "roads",
            "sector_boundary",
            "sewerage_line",
            "strom_drains",
            "tehsil",
            "telcom_utility",
            "telcom_utility_line",
            "water_utility",
            "water_utility_line"
        ]
    },
    "allowed_fields": ["id", "subtype", "Acre_No", "Area_Acres", "Area_Kanals", "Area_Kanals", "Area_Marlas", "Area_Sqkm", "Area_Sqkm", "Area_Sqmt", "Balloted", "Block", "Block_Count", "Block_Count", "Camera_Location", "Category", "Constructed", "Corner_Plots", "Creation_Date", "Damaged_Plots", "Dimension", "District", "District", "Elevation", "Extra_Land_Plots", "Front_Open_Plots", "Khasra_No", "Last_Updated", "Latitude", "Length_Km", "Length_Km", "Length_Meter", "Location", "Longitude", "Map_Version", "Marraba_No", "Mauza", "Mauza_Code", "Name", "Offer_Cost", "Offered_By", "Phase", "Phase_Count", "Plot_Area_Sqft", "Plot_Area_Sqyd", "Plot_Count", "Plot_No", "Plot_Size", "Project", "Remarks", "Reserved", "Road", "Road_Width", "Sector", "Sector_Count", "Sector_Count", "Special_Category", "Status", "Street", "Sub_Khasra_No", "Tehsil", "Tehsil", "Type", "Unit", "mauza_name"]

}