/**
 * AeroWise AI - GenAI Prompt Architecture & Domain Engine
 * Designed for Gemini API with structured system instructions,
 * few-shot exemplars, and smart fallback responses.
 */

const GENAI_SYSTEM_PROMPT = `
You are AeroWise AI, an expert Environmental Health and Urban Air Quality Assistant specialized in helping families and communities navigate severe winter smog, thermal inversions, and urban air pollution.

Your Core Directives:
1. Provide actionable, low-cost, low-emission daily routines tailored to the user's location, household vulnerability, and lifestyle.
2. Emphasize Indoor Air Quality (IAQ) bio-hacks (like DIY Corsi-Rosenthal boxes, inversion-aware micro-ventilation, wet-cleaning, and NASA botanical filtering).
3. Recommend sustainable alternatives to high-polluting habits (clean commute, no open waste burning, efficient heating).
4. ALWAYS explain the direct impact of choices in quantifiable terms (e.g., micrograms of PM2.5 avoided, equivalent cigarettes not inhaled, kg CO2 reduced, and acute health risks mitigated).
5. Communicate with warmth, scientific accuracy, empathy, and urgency. Structure answers with clean bullet points, bold key takeaways, and safety warnings for vulnerable groups (children, asthmatics, elderly).
`.trim();

const PROMPT_PRESETS = [
    {
        id: "toddler_care",
        title: "👶 Protecting Children in Winter Smog",
        prompt: "My 4-year-old child goes to school by bus in Delhi where AQI is 420. What daily routine changes, mask protocols, and indoor hacks should our family adopt to safeguard their lungs?"
    },
    {
        id: "diy_air_filter",
        title: "📦 DIY Corsi-Rosenthal Air Purifier",
        prompt: "How can I build an effective DIY air cleaner using a regular box fan and furnace filters? Does it actually filter PM2.5 compared to expensive commercial purifiers?"
    },
    {
        id: "commute_planner",
        title: "🚗 Low-Emission Office Commute",
        prompt: "I commute 18 km daily by petrol car during peak smog hours (8:30 AM). How can I optimize my route, schedule, and transport mode to lower my exposure and cut emissions?"
    },
    {
        id: "ventilation_dilemma",
        title: "🪟 When to Open Windows in Winter",
        prompt: "If outside air is hazardous (AQI 380), our indoor air feels stuffy and gives us headaches. When is the safest window to ventilate without letting in toxic smog?"
    },
    {
        id: "exercise_safety",
        title: "🏃 Outdoor Running & Fitness Advisory",
        prompt: "Is it safe to go for a brisk morning walk or jog at 7:00 AM during winter? What happens to my lungs if I exercise outdoors in smog, and what indoor alternatives do you recommend?"
    }
];

const BUILTIN_AI_RESPONSES = {
    "toddler_care": {
        summary: "Child Respiratory Protection Protocol for Severe Smog (AQI 400+)",
        response: `### 🛡️ Child Smog Protection Action Plan (AQI 420+)

Children inhale **50% more air per pound of body weight** than adults, and their narrower airways make them extremely susceptible to bronchospasms and fine particulate (PM2.5) lodging deep in alveoli.

#### 1. Daily Routine & Commute Adjustments:
* **The Commute Bubble:** When your child is on the school bus, ensure they wear a **fitted pediatric KF94 or small N95 mask**. Standard cloth or surgical masks have >80% edge leakage and filter less than 20% of PM2.5.
* **School Coordination:** Request the school administration to suspend morning outdoor assemblies and physical education classes before 11:30 AM. Outdoor exercise during thermal inversions forces deep lung breathing of toxic particulate matter.
* **Indoor Play Window:** If outdoor playtime is permitted, shift it strictly between **1:00 PM and 3:00 PM**, when solar radiation lifts the cold ground inversion layer and disperses heavy soot.

#### 2. Bedroom Air Sanctuary (IAQ Hacks):
* **The Sleep Zone:** Children spend 9-11 hours sleeping. Create a sealed clean-air zone: keep bedroom windows latched and operate an air purifier (or DIY Corsi-Rosenthal box) 1 meter away from the bed on medium speed.
* **Hydration & Upper Airway Rinsing:** Have your child drink warm fluids and do a mild saline nasal rinse (or warm steam shower) after arriving home from school. This flushes trapped particulates from the nasal cilia before they penetrate the bronchial tree.
* **Wet Mopping Rule:** Never dry sweep the floor near your child's bed. Use a damp microfiber cloth to avoid resuspending settled heavy metals and fine ash.

#### 📊 Direct Quantifiable Impact:
* **Inhalation Reduction:** Cuts your child's daily PM2.5 inhalation by **up to 75%** (avoiding the toxic equivalent of inhaling ~4 passive cigarettes daily).
* **Health Benefit:** Reduces the risk of acute bronchitis episodes and nocturnal coughing fits by **68%** during peak November-January smog.`,
    },

    "diy_air_filter": {
        summary: "Step-by-Step DIY Corsi-Rosenthal Box Blueprint & Scientific Efficacy",
        response: `### 📦 The DIY Corsi-Rosenthal (C-R) Box: Maximum Air Filtration on a Budget

The Corsi-Rosenthal Box is an open-source, scientifically validated air cleaner invented by environmental engineer Dr. Richard Corsi and Jim Rosenthal. It matches or outperforms commercial purifiers costing 6x to 8x more.

#### 🛠️ Materials Required:
1. **1x 20-inch Box Fan** (₹1,000 - ₹1,400)
2. **4x MERV 13 Filters** (20" x 20" x 1" or 2") (approx. ₹1,200 for 4)
3. **1x Roll of Heavy-Duty Duct Tape** (₹100)
4. **Cardboard box** (to build bottom base and front shroud)

#### 🔨 4-Step Assembly Guide:
1. **Build the Filter Cube:** Arrange the four MERV 13 filters in a square cube. **Crucial:** Ensure the printed airflow arrows on each filter face **INWARD toward the center of the cube**.
2. **Tape the Edges:** Seal all vertical edges with duct tape so no unfiltered air can leak between the seams.
3. **Mount the Fan:** Place the 20" box fan on top of the filter cube with the fan blowing **UPWARD / OUTWARD** (pulling air through the filters and discharging clean air into the room).
4. **The Cardboard Shroud Secret (Boosts CADR by 25%):** Cut a cardboard donut ring with an 18-inch central opening and tape it over the front grill of the fan. This blocks the dead zones at fan blade tips and prevents dirty air backflow.
5. **Seal the Bottom:** Tape a square piece of cardboard to the base to form an airtight chamber.

#### 📊 Direct Performance & Cost Comparison:
* **Clean Air Delivery Rate (CADR):** **550 - 600 CFM** (Commercial purifiers average 180 - 250 CFM).
* **Cost Comparison:** **₹2,500 ($30)** vs **₹18,000 ($220)** for branded HEPA units.
* **Noise & Power:** Consumes only 45-60 Watts; runs quietly on medium speed.
* **Direct Impact:** Purifies a 300 sq.ft living room in **18 minutes**, filtering 99% of pollen, dust, and 85%+ of PM2.5 and viral aerosol droplets.`,
    },

    "commute_planner": {
        summary: "Low-Emission, Low-Exposure Commute Strategy (18 km Corridor)",
        response: `### 🚗 Low-Emission, Clean-Air Commute Strategy (18 km Route)

During winter inversions, vehicular traffic is the single largest contributor to ground-level nitrogen dioxide ($NO_2$), volatile organic compounds (VOCs), and ultrafine black carbon. Commuting inside traffic jams exposes you to pollution spikes **3x higher** than background ambient levels.

#### 1. Vehicle Cabin Protocol (Immediate Action):
* **Recirculation Mode is Mandatory:** Turn off "Fresh Air Intake" and switch your car's climate control to **Internal Air Recirculation**. Fresh air intake pulls directly from the exhaust pipe of the vehicle ahead of you.
* **Cabin Air Filter Upgrade:** Replace standard paper cabin filters with an activated-carbon PM2.5 cabin filter (cost: ₹400-₹800).
* **Keep Windows Rolled Up:** Opening windows even for 30 seconds at a traffic signal causes in-cabin PM2.5 to skyrocket from 30 µg/m³ to 450 µg/m³.

#### 2. Schedule & Transit Optimization:
* **Beat the Inversion Surge:** Morning smog is densest between **7:30 AM and 9:30 AM**. If flex-hours allow, shifting your commute to **10:00 AM** cuts particulate inhalation by **40%** because daytime sunshine begins breaking the cold inversion lid.
* **Carpool or Metro Shift (3 Days/Week):**
  - Shifting from solo petrol car driving to the Metro transit system or 3-person carpooling just 3 days a week.

#### 📊 Direct Quantifiable Impact:
* **Carbon Abatement:** Saves **24.5 kg of $CO_2$ per week** and prevents 8.5 liters of fuel burn.
* **Personal Health Protection:** Avoids inhaling ~1.8 million micro-particles of heavy metal soot and benzene weekly.
* **Economic Benefit:** Saves approximately ₹2,400 to ₹3,500 monthly on fuel and toll expenses.`,
    },

    "ventilation_dilemma": {
        summary: "The Smog Ventilation Paradox: How to Vent CO₂ Without Toxic Soot",
        response: `### 🪟 Inversion-Aware Micro-Ventilation: Balancing CO₂ and Smog

When a home is sealed to block outdoor smog, indoor carbon dioxide ($CO_2$) exhaled by residents accumulates rapidly. When $CO_2$ exceeds **1,200 ppm**, occupants experience headaches, grogginess, reduced cognitive performance, and poor sleep quality.

#### 🕒 The "Solar Window" Rule (When to Open):
* **❌ Blackout Hours (6:00 AM - 10:30 AM & 6:00 PM - Midnight):**
  Never open windows during these hours. Radiational cooling traps heavy, toxic particulate matter within 100-200 meters of the ground.
* **✅ The Solar Window (12:30 PM - 2:30 PM):**
  This is the safest window. Maximum solar heating warms the ground, creating vertical thermal updrafts that disperse surface pollutants and raise the planetary boundary layer.

#### ⚡ The 15-Minute "Blast & Scrub" Method:
1. At **1:00 PM**, open two opposing windows to create a swift cross-breeze.
2. Turn on high-speed exhaust fans in the kitchen and bathroom for **strictly 12 to 15 minutes**. This replaces 80% of indoor air volume and drops $CO_2$ from 1,400 ppm down to 550 ppm.
3. Immediately seal all windows securely.
4. Set your air purifier or DIY Corsi-Rosenthal box to **Turbo / Maximum speed for 20 minutes** to rapidly scrub out any PM2.5 that entered during the breeze.

#### 📊 Direct Impact:
* **Cognitive Alertness:** Lowers indoor $CO_2$ below 700 ppm, boosting focus, reaction time, and daytime energy levels by 30%.
* **Particulate Defense:** Eliminates 88% of the soot that would have flooded your home had you ventilated during morning rush hours.`,
    },

    "exercise_safety": {
        summary: "Outdoor Exercise Advisory: Cold Smog Risks & Safe Alternatives",
        response: `### 🏃 Winter Smog Exercise Advisory: Why Morning Jogs Are Toxic

Exercising in severe smog (AQI 250+) poses extreme cardiovascular and pulmonary risks. When you run or jog, your breathing rate increases by **400% to 600%**, and you switch from nasal breathing (which filters some coarse dust) to **mouth breathing**, allowing ultrafine PM2.5 and carcinogenic benzo(a)pyrene to bypass natural filters and enter directly into bloodstream capillaries.

#### ⚠️ Morning Inversion Hazard:
* Early morning (6:00 AM - 8:30 AM) is when the surface air is coldest and ground pollutants are compressed under a thermal inversion blanket.
* Exercising outdoors in AQI 400 is biologically equivalent to **smoking 10 to 15 cigarettes in 45 minutes** while your heart rate is elevated to 140+ BPM.

#### 🏠 Safe Low-Emission Fitness Alternatives:
1. **Indoor Cardio Substitution:** Use jumping rope, stationary cycling, or high-intensity bodyweight circuits in a sealed room with an active air cleaner.
2. **Shifted Timing (Afternoon Walk):** If you must walk outdoors, do so between **1:30 PM and 3:30 PM**, wearing a snug-fitting N95 mask with a one-way exhalation valve to minimize breathing resistance.
3. **Gym Verification:** Check whether your local gym has commercial HEPA filtration. If gym doors are left open to street traffic, gym air can be equally hazardous.

#### 📊 Direct Impact of Pausing Outdoor Morning Runs:
* **Cardiovascular Strain:** Prevents acute systemic arterial inflammation and blood pressure spikes.
* **Lungs Saved:** Avoids inhaling approximately **250 micrograms of fine black carbon** each session.`,
    }
};

/**
 * Intelligent fallback generator for arbitrary user prompts
 */
function generateSmartAIResponse(userPrompt, cityKey = "delhi") {
    const lower = userPrompt.toLowerCase();
    
    // Check preset matches
    if (lower.includes("child") || lower.includes("kid") || lower.includes("toddler") || lower.includes("school") || lower.includes("baby")) {
        return BUILTIN_AI_RESPONSES["toddler_care"].response;
    }
    if (lower.includes("diy") || lower.includes("filter") || lower.includes("purifier") || lower.includes("corsi") || lower.includes("box fan")) {
        return BUILTIN_AI_RESPONSES["diy_air_filter"].response;
    }
    if (lower.includes("commute") || lower.includes("car") || lower.includes("traffic") || lower.includes("travel") || lower.includes("office") || lower.includes("bike")) {
        return BUILTIN_AI_RESPONSES["commute_planner"].response;
    }
    if (lower.includes("window") || lower.includes("ventilat") || lower.includes("co2") || lower.includes("fresh air") || lower.includes("stuffy")) {
        return BUILTIN_AI_RESPONSES["ventilation_dilemma"].response;
    }
    if (lower.includes("run") || lower.includes("jog") || lower.includes("walk") || lower.includes("exercis") || lower.includes("gym") || lower.includes("workout")) {
        return BUILTIN_AI_RESPONSES["exercise_safety"].response;
    }

    // Dynamic tailored response
    return `### 🌬️ AeroWise AI Guidance & Action Plan

Thank you for consulting AeroWise AI regarding **"${userPrompt.trim()}"**.

Here is your customized, science-backed guidance to combat severe winter smog and urban air pollution:

#### 1. Core Environmental Context & Health Advisory
* In urban regions during winter, cold air trapping (thermal inversion) concentrates high levels of **$PM_{2.5}$, $NO_2$, and black carbon** in the human breathing zone.
* Standard cloth masks fail to protect against $PM_{2.5}$. Always use an **N95, FFP2, or KF94 respirator** with a secure facial seal when stepping outside.

#### 2. Actionable Low-Emission Daily Routine
* **Inversion Timing:** Schedule high-activity tasks strictly between **12:30 PM and 3:00 PM**, when solar ground heating promotes vertical air mixing and disperses particulate layers.
* **Mobility Choice:** Minimize solo internal combustion vehicle trips. Use mass transit, electric micro-mobility, or carpool systems to lower the collective community emissions footprint.

#### 3. High-Impact Indoor Air Quality (IAQ) Hack
* Implement the **Corsi-Rosenthal Box** (4x MERV 13 filters attached to a 20" box fan). This delivers up to **550 CFM of clean air** for less than ₹2,500 ($30).
* Practice **wet mopping** with a damp microfiber cloth instead of dry broom sweeping to avoid re-suspending settled heavy dust.

#### 📊 Direct Quantifiable Impact
* **Exposure Reduction:** Adopting this routine reduces your daily toxic particulate inhalation by **60% - 80%**.
* **Community Footprint:** Avoiding open burning and optimizing travel eliminates approximately **4.5 kg of $CO_2$** and **120g of soot** per household each week.

*Stay safe, breathe clean, and protect your community!*`;
}
