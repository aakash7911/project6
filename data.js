/**
 * AeroWise AI - Domain Knowledge & Dataset
 * Contains smog hotspot profiles, IAQ bio-hacks, lifestyle presets,
 * NASA botanical metrics, and GenAI prompt templates.
 */

const AIR_QUALITY_DATA = {
    cities: {
        "delhi": {
            name: "Delhi NCR, India",
            aqi: 432,
            category: "Hazardous / Severe",
            color: "#e11d48", // rose-600
            pm25: 320,
            pm10: 485,
            no2: 85,
            co: 3.2,
            temp: "14°C",
            humidity: "78%",
            inversion: "Severe (Thermal Inversion Layer at 210m)",
            primarySources: "Vehicular exhaust (42%), Stubble & Biomass burning (28%), Construction dust (18%), Industrial emissions (12%)",
            recommendation: "Stay indoors. Keep windows sealed until 12:30 PM. Run indoor air filtration. N95 mask mandatory outdoors."
        },
        "lahore": {
            name: "Lahore, Pakistan",
            aqi: 418,
            category: "Hazardous / Severe",
            color: "#e11d48",
            pm25: 298,
            pm10: 460,
            no2: 78,
            co: 2.9,
            temp: "15°C",
            humidity: "82%",
            inversion: "Severe winter smog trapping ground-level pollutants",
            primarySources: "Low-grade transport fuel, Brick kilns, Biomass heating, Stubble burning",
            recommendation: "Avoid outdoor exercise. Use sealed N95 masks. Utilize air purifiers in bedrooms."
        },
        "beijing": {
            name: "Beijing, China",
            aqi: 172,
            category: "Unhealthy",
            color: "#f97316", // orange-500
            pm25: 95,
            pm10: 165,
            no2: 45,
            co: 1.4,
            temp: "4°C",
            humidity: "42%",
            inversion: "Moderate Siberian boundary layer pressure",
            primarySources: "Coal district heating, heavy diesel transit, regional industrial drift",
            recommendation: "Sensitive groups limit outdoor activity. Ventilation safe between 1 PM and 3 PM."
        },
        "mumbai": {
            name: "Mumbai, India",
            aqi: 188,
            category: "Unhealthy for Sensitive Groups",
            color: "#f59e0b", // amber-500
            pm25: 110,
            pm10: 190,
            no2: 52,
            co: 1.8,
            temp: "27°C",
            humidity: "65%",
            inversion: "Coastal haze combined with high traffic idling",
            primarySources: "Construction dust, high traffic congestion, refinery and coastal emissions",
            recommendation: "Children and asthmatics wear masks during school commute."
        },
        "london": {
            name: "London, UK",
            aqi: 48,
            category: "Good",
            color: "#10b981", // emerald-500
            pm25: 11,
            pm10: 22,
            no2: 24,
            co: 0.6,
            temp: "9°C",
            humidity: "86%",
            inversion: "Low inversion risk",
            primarySources: "Wood-burning stoves, localized diesel transport",
            recommendation: "Air quality is satisfactory. Outdoor activities are safe."
        },
        "newyork": {
            name: "New York, USA",
            aqi: 58,
            category: "Moderate",
            color: "#eab308",
            pm25: 15,
            pm10: 34,
            no2: 28,
            co: 0.8,
            temp: "7°C",
            humidity: "55%",
            inversion: "Minimal inversion",
            primarySources: "Interstate highway transit, building heating boilers",
            recommendation: "Ideal conditions for most people; sensitive individuals monitor exertion."
        }
    },

    iaqBioHacks: [
        {
            id: "corsi-rosenthal",
            title: "Corsi-Rosenthal (CR) Box Air Purifier",
            category: "DIY Hardware",
            difficulty: "Easy (30 mins build)",
            estimatedCost: "₹2,200 ($28)",
            commercialEquivalent: "₹18,000 ($220)",
            cadr: "550 - 620 CFM (Clean Air Delivery Rate)",
            materials: ["1x 20-inch standard box fan", "4x MERV 13 filters (20x20x1)", "Duct tape / Painter tape", "1x Cardboard shroud for fan face"],
            instructions: [
                "Arrange the four MERV 13 filters in a square cube with airflow arrows pointing INWARD.",
                "Tape the edges tightly with duct tape to form a leak-free 4-sided filter column.",
                "Place the box fan on top with airflow blowing UPWARD / OUTWARD, away from the box.",
                "Cut a cardboard circular shroud (with an 18-inch hole) and tape it over the front fan grill to prevent air vortices and boost CADR by 25%.",
                "Seal the bottom with cardboard and tape. Turn on low or medium speed for silent continuous filtration."
            ],
            directImpact: "Reduces indoor PM2.5 concentrations by 82% within 25 minutes in a 250 sq.ft room at 1/8th the cost of commercial HEPA purifiers."
        },
        {
            id: "ventilation-window",
            title: "Inversion-Aware Micro-Ventilation",
            category: "Smart Routine",
            difficulty: "Zero Cost",
            estimatedCost: "₹0",
            commercialEquivalent: "N/A",
            cadr: "Natural Air Exchange",
            materials: ["Timer / Smart plug", "Outdoor AQI app"],
            instructions: [
                "NEVER open windows between 6:00 AM - 10:00 AM (ground-level thermal inversion traps cold polluted air).",
                "Crack open opposing cross-ventilation windows only between 12:30 PM - 2:30 PM when solar heating breaks the inversion lid.",
                "Ventilate for strictly 15 minutes to flush indoor CO₂ (<800 ppm) without saturating furniture with particulates.",
                "Immediately reseal windows and run your air cleaner on boost speed for 20 minutes."
            ],
            directImpact: "Prevents indoor CO₂ cognitive fatigue while stopping 90% of morning peak toxic smog from entering your living space."
        },
        {
            id: "wet-cleaning",
            title: "Hydro-Cleaning (Wet Mopping vs Sweeping)",
            category: "Indoor Protocol",
            difficulty: "Daily Habit",
            estimatedCost: "₹0",
            commercialEquivalent: "₹5,000 (Vacuum with HEPA)",
            cadr: "Passive Dust Capture",
            materials: ["Microfiber mop", "Warm water with mild soap", "Damp cloth"],
            instructions: [
                "Ban dry broom sweeping during high AQI days (dry brooms re-suspend settled PM2.5 and PM10 particles into your breathing zone for up to 4 hours).",
                "Use a damp microfiber mop twice daily—once at noon and once in the evening.",
                "Wipe window sills and door frames with a damp microfiber cloth to trap settled soot before it becomes airborne."
            ],
            directImpact: "Stops 75% of particulate re-suspension, eliminating the equivalent of inhaling smoke from 2 cigarettes daily indoors."
        },
        {
            id: "botanical-filters",
            title: "NASA Clean Air Botanical Matrix",
            category: "Bio-Purification",
            difficulty: "Low Maintenance",
            estimatedCost: "₹300 - ₹800 ($4 - $10)",
            commercialEquivalent: "Natural Supplement",
            cadr: "VOC & Night Oxygenation",
            materials: ["Snake Plant (Sansevieria)", "Areca Palm", "Spider Plant", "Money Plant"],
            instructions: [
                "Snake Plant: Keep 2-3 in bedroom. Unlike most plants, it converts CO₂ to Oxygen at NIGHT (Crassulacean Acid Metabolism).",
                "Areca Palm: Keep 4 waist-high plants per person in living areas for natural air humidification and VOC breakdown (Formaldehyde/Xylene).",
                "Spider Plant: Absorbs carbon monoxide and airborne solvents.",
                "Wipe plant leaves with a damp cloth weekly so stomata pores don't get clogged by smog dust."
            ],
            directImpact: "Improves bedroom nocturnal oxygen levels and reduces volatile organic compounds (VOCs) by 40%."
        }
    ],

    lifestyleProfiles: {
        "family_kids": {
            title: "Family with School-Going Children",
            description: "Prioritizes children's respiratory safety, school commute, and indoor playtime.",
            vulnerability: "High (Children breathe 50% more air per pound of body weight than adults).",
            defaultCommute: "School Bus / Carpool",
            keyActions: [
                "Shift outdoor playtime to 1:00 PM - 3:00 PM; strictly indoors during morning hours.",
                "Ensure child wears a fitted child-size N95 or KN95 mask (cloth masks offer less than 20% PM2.5 filtration).",
                "Coordinate with school to install DIY Corsi-Rosenthal boxes in classrooms.",
                "Keep bedroom air purifier running on medium all night with bedroom door shut."
            ]
        },
        "elderly_asthma": {
            title: "Senior Citizens & Asthmatic Family Members",
            description: "High-risk profile requiring minimized cardiovascular strain and particulate exposure.",
            vulnerability: "Critical (Smog spikes trigger bronchospasms, COPD flare-ups, and elevated blood pressure).",
            defaultCommute: "Stay Indoors / Medical Appointments Only",
            keyActions: [
                "Strict curfew: Zero outdoor morning walks before 11:00 AM.",
                "Substitute morning park walks with indoor hallway walking or light yoga near a HEPA filter.",
                "Keep bronchodilator/inhaler within arm's reach and check peak flow meter daily.",
                "Steam inhalation with clean saline water in the evening to clear upper mucosal lining."
            ]
        },
        "daily_commuter": {
            title: "Urban Office Commuter",
            description: "Navigates rush-hour gridlock, subway systems, and traffic corridors.",
            vulnerability: "Moderate-High (Traffic idling corridors have 3-5x higher localized PM2.5 & NO₂).",
            defaultCommute: "Solo ICE Vehicle or Two-Wheeler",
            keyActions: [
                "If riding two-wheeler: Mandatory N95 with exhaust valve (or tight seal N95). Open helmets expose lungs to 800+ µg/m³ in traffic.",
                "If driving car: Set cabin AC to 'Recirculation Mode' (air intake from outside brings in toxic NO₂ and soot).",
                "Shift morning commute 45 minutes earlier or later to avoid peak idling bottlenecks.",
                "Switch to Metro transit or carpooling 3 days/week to cut personal carbon and emissions."
            ]
        },
        "work_from_home": {
            title: "Remote Worker / Apartment Living",
            description: "Spends 90%+ time indoors; vulnerable to indoor CO₂ buildup and stale particle trapping.",
            vulnerability: "Moderate (Indoor pollution traps VOCs, cooking fumes, and fine dust).",
            defaultCommute: "Home-based",
            keyActions: [
                "Turn on kitchen exhaust fan whenever cooking; gas stoves produce high NO₂ spikes.",
                "Execute 15-minute cross-ventilation at 1:30 PM daily to reset indoor CO₂ below 700 ppm.",
                "Set up home office away from street-facing windows.",
                "Place DIY CR box right next to work desk."
            ]
        }
    },

    impactConstants: {
        carpoolCo2SavedKgPerDay: 4.8,
        metroTransitCo2SavedKgPerDay: 7.2,
        cleanHeatingCo2SavedKgPerDay: 8.5,
        noBurningCo2SavedKgPerDay: 12.0,
        pm25MicrogramsPerCigarette: 22, // Inhaling 22 µg/m3 over 24h is approx equivalent to 1 cigarette
        averageBreathingVolumeLitersPerDay: 11000
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIR_QUALITY_DATA;
}
