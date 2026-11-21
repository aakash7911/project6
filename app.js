/**
 * AeroWise AI - Core Application Logic
 * Integrates real-time smog metrics, diurnal charts, GenAI routine synthesis,
 * IAQ calculators, sustainable impact modeling, and the live AI Copilot.
 */

// Application State
const state = {
    currentCity: "delhi",
    currentTab: "overview",
    apiKey: localStorage.getItem("aerowise_gemini_api_key") || "",
    selectedModel: localStorage.getItem("aerowise_gemini_model") || "gemini-1.5-flash",
    hasPledged: false,
    pledgeCount: 1482,
    commuteKm: 15,
    commuteMode: "carpool", // car | carpool | metro
    heatingMode: "clean",   // biomass | clean
    wasteMode: "compost",   // burning | compost
    chartDiurnal: null,
    chartImpact: null
};

// Initialize Application on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    initIcons();
    initEventListeners();
    initSettings();
    updateCityMetrics(state.currentCity);
    initCharts();
    generateRoutine(); // Pre-populate routine tab
    updateImpactCalculations(); // Pre-populate impact tab
});

function initIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Event Listeners
function initEventListeners() {
    // Tab switching
    document.querySelectorAll(".nav-tab").forEach(tabBtn => {
        tabBtn.addEventListener("click", () => {
            const tabId = tabBtn.getAttribute("data-tab");
            switchTab(tabId);
        });
    });

    // City selector
    const citySelector = document.getElementById("city-selector");
    if (citySelector) {
        citySelector.addEventListener("change", (e) => {
            state.currentCity = e.target.value;
            updateCityMetrics(state.currentCity);
        });
    }

    // Routine Generator Button
    const btnGenRoutine = document.getElementById("btn-generate-routine");
    if (btnGenRoutine) {
        btnGenRoutine.addEventListener("click", () => {
            generateRoutine();
        });
    }

    // IAQ Room Slider
    const crSlider = document.getElementById("cr-room-slider");
    if (crSlider) {
        crSlider.addEventListener("input", (e) => {
            updateCRBoxCalculator(parseInt(e.target.value));
        });
    }

    // Impact Commute Slider
    const commuteSlider = document.getElementById("slider-commute-km");
    if (commuteSlider) {
        commuteSlider.addEventListener("input", (e) => {
            state.commuteKm = parseInt(e.target.value);
            document.getElementById("lbl-commute-km").textContent = `${state.commuteKm} km`;
            updateImpactCalculations();
        });
    }

    // Community Hazard Form
    const hazardForm = document.getElementById("hazard-report-form");
    if (hazardForm) {
        hazardForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleHazardReport();
        });
    }

    // Community Pledge Button
    const btnPledge = document.getElementById("btn-take-pledge");
    if (btnPledge) {
        btnPledge.addEventListener("click", () => {
            handlePledgeToggle();
        });
    }

    // Chat input
    const chatInput = document.getElementById("chat-input-field");
    const btnSendChat = document.getElementById("btn-send-chat");
    const btnClearChat = document.getElementById("btn-clear-chat");

    if (btnSendChat && chatInput) {
        btnSendChat.addEventListener("click", () => {
            sendMessage(chatInput.value);
        });
        chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                sendMessage(chatInput.value);
            }
        });
    }

    if (btnClearChat) {
        btnClearChat.addEventListener("click", () => {
            const container = document.getElementById("chat-messages-container");
            container.innerHTML = `
              <div class="flex items-start space-x-3">
                <div class="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <i data-lucide="bot" class="w-4 h-4"></i>
                </div>
                <div class="chat-bubble-bot p-4 max-w-2xl text-xs space-y-2 leading-relaxed">
                  <p class="font-semibold text-white">Chat cleared. Ready for your questions on winter smog navigation!</p>
                </div>
              </div>
            `;
            initIcons();
        });
    }

    // Settings Modal
    const btnOpenSettings = document.getElementById("btn-open-settings");
    const btnCloseSettings = document.getElementById("btn-close-settings");
    const btnSaveSettings = document.getElementById("btn-save-settings");
    const settingsModal = document.getElementById("settings-modal");

    if (btnOpenSettings && settingsModal) {
        btnOpenSettings.addEventListener("click", () => {
            settingsModal.classList.remove("hidden");
        });
    }
    if (btnCloseSettings && settingsModal) {
        btnCloseSettings.addEventListener("click", () => {
            settingsModal.classList.add("hidden");
        });
    }
    if (btnSaveSettings && settingsModal) {
        btnSaveSettings.addEventListener("click", () => {
            saveSettings();
        });
    }
}

// Tab Switching
function switchTab(tabId) {
    state.currentTab = tabId;
    
    // Update tab buttons
    document.querySelectorAll(".nav-tab").forEach(btn => {
        if (btn.getAttribute("data-tab") === tabId) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Update tab panes
    document.querySelectorAll(".tab-pane").forEach(pane => {
        pane.classList.add("hidden");
    });

    const targetPane = document.getElementById(`tab-${tabId}`);
    if (targetPane) {
        targetPane.classList.remove("hidden");
        targetPane.classList.add("fade-in");
    }

    // Refresh charts if needed
    if (tabId === "overview" && state.chartDiurnal) {
        state.chartDiurnal.resize();
    } else if (tabId === "alternatives" && state.chartImpact) {
        state.chartImpact.resize();
    }

    initIcons();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Update UI with City Air Quality Data
function updateCityMetrics(cityKey) {
    const city = AIR_QUALITY_DATA.cities[cityKey];
    if (!city) return;

    // Header & Alert
    const headerInversion = document.getElementById("header-inversion-badge");
    const alertBanner = document.getElementById("overview-alert-banner");
    const alertTitle = document.getElementById("alert-title");
    const alertDesc = document.getElementById("alert-desc");
    
    // Gauge & Numbers
    const aqiDisplay = document.getElementById("aqi-display-value");
    const aqiCategory = document.getElementById("aqi-display-category");
    const aqiCity = document.getElementById("aqi-city-name");
    const gaugeCircle = document.getElementById("aqi-gauge-circle");

    aqiDisplay.textContent = city.aqi;
    aqiCategory.textContent = city.category;
    aqiCity.textContent = city.name;
    
    // Color categorization
    let catClass = "bg-rose-900/80 text-rose-300";
    if (city.aqi <= 50) catClass = "bg-emerald-900/80 text-emerald-300";
    else if (city.aqi <= 100) catClass = "bg-amber-900/80 text-amber-300";
    else if (city.aqi <= 200) catClass = "bg-orange-900/80 text-orange-300";

    aqiCategory.className = `text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${catClass}`;

    // SVG Gauge Dashoffset (max 500 = 0 offset, 0 = 251.2 offset)
    const maxAqi = 500;
    const progress = Math.min(city.aqi / maxAqi, 1);
    const strokeDashoffset = 251.2 - (251.2 * progress);
    gaugeCircle.setAttribute("stroke-dashoffset", strokeDashoffset);
    gaugeCircle.setAttribute("stroke", city.color);

    // Pollutants
    document.getElementById("val-pm25").textContent = `${city.pm25} µg/m³`;
    document.getElementById("val-pm10").textContent = `${city.pm10} µg/m³`;
    document.getElementById("val-no2").textContent = `${city.no2} ppb`;
    document.getElementById("val-temp").textContent = `${city.temp} / ${city.humidity}`;
    document.getElementById("primary-sources-label").textContent = `Primary Sources: ${city.primarySources}`;
    document.getElementById("routine-city-name").textContent = city.name;

    // Inversion Banner state
    const isSevere = city.aqi > 250;
    if (isSevere) {
        if (headerInversion) headerInversion.classList.remove("hidden");
        alertBanner.className = "p-4 rounded-xl border bg-rose-950/40 border-rose-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4";
        alertTitle.textContent = `Severe Winter Smog Inversion Active (${city.name})`;
        alertDesc.textContent = `${city.inversion}. Particulates trapped below boundary ceiling. N95 recommended outdoors.`;
    } else {
        if (headerInversion) headerInversion.classList.add("hidden");
        alertBanner.className = "p-4 rounded-xl border bg-slate-900/40 border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4";
        alertTitle.textContent = `Air Quality Advisory for ${city.name}`;
        alertDesc.textContent = `${city.category}. ${city.recommendation}`;
    }

    // Refresh diurnal chart for this city's magnitude
    updateDiurnalChart(city.aqi);
}

// Chart Initializations
function initCharts() {
    // 1. Diurnal Smog Inversion Chart
    const ctxDiurnal = document.getElementById("smogDiurnalChart");
    if (ctxDiurnal) {
        state.chartDiurnal = new Chart(ctxDiurnal, {
            type: "line",
            data: {
                labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "2 PM", "4 PM", "7 PM", "10 PM"],
                datasets: [
                    {
                        label: "Ambient PM2.5 (µg/m³)",
                        data: [380, 420, 490, 440, 210, 180, 240, 390, 430],
                        borderColor: "#e11d48",
                        backgroundColor: "rgba(225, 29, 72, 0.15)",
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: "#e11d48"
                    },
                    {
                        label: "Safe Outdoor Window (Solar Convection)",
                        data: [null, null, null, null, 150, 140, null, null, null],
                        borderColor: "#10b981",
                        borderWidth: 3,
                        pointRadius: 6,
                        pointBackgroundColor: "#10b981",
                        showLine: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: "#94a3b8", font: { size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                if (context.datasetIndex === 0 && context.dataIndex >= 4 && context.dataIndex <= 5) {
                                    return "⭐ Optimal Solar Window: Safe for 15-min ventilation & errands.";
                                }
                                if (context.dataIndex <= 2 || context.dataIndex >= 7) {
                                    return "⚠️ Nocturnal Inversion: Stay indoors, seal windows.";
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: "#94a3b8", font: { size: 10 } },
                        grid: { color: "rgba(255, 255, 255, 0.05)" }
                    },
                    y: {
                        ticks: { color: "#94a3b8", font: { size: 10 } },
                        grid: { color: "rgba(255, 255, 255, 0.05)" }
                    }
                }
            }
        });
    }

    // 2. Impact Comparison Chart
    const ctxImpact = document.getElementById("impactComparisonChart");
    if (ctxImpact) {
        state.chartImpact = new Chart(ctxImpact, {
            type: "bar",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                    {
                        label: "Standard Uncontrolled Exposure (µg Inhaled)",
                        data: [420, 440, 410, 480, 460, 390, 430],
                        backgroundColor: "rgba(244, 63, 94, 0.65)",
                        borderRadius: 6
                    },
                    {
                        label: "AeroWise AI Guided Exposure (µg Inhaled)",
                        data: [110, 125, 105, 130, 120, 95, 100],
                        backgroundColor: "rgba(16, 185, 129, 0.8)",
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: "#94a3b8", font: { size: 11 } }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: "#94a3b8", font: { size: 10 } },
                        grid: { color: "rgba(255, 255, 255, 0.05)" }
                    },
                    y: {
                        ticks: { color: "#94a3b8", font: { size: 10 } },
                        grid: { color: "rgba(255, 255, 255, 0.05)" }
                    }
                }
            }
        });
    }
}

function updateDiurnalChart(baseAqi) {
    if (!state.chartDiurnal) return;
    const factor = baseAqi / 430;
    const newAqiCurve = [
        Math.round(380 * factor),
        Math.round(420 * factor),
        Math.round(490 * factor),
        Math.round(440 * factor),
        Math.round(210 * factor),
        Math.round(180 * factor),
        Math.round(240 * factor),
        Math.round(390 * factor),
        Math.round(430 * factor)
    ];
    state.chartDiurnal.data.datasets[0].data = newAqiCurve;
    state.chartDiurnal.update();
}

// GenAI Routine Synthesizer
function generateRoutine() {
    const profileKey = document.getElementById("routine-profile-select")?.value || "family_kids";
    const commuteMode = document.getElementById("routine-commute-select")?.value || "metro";
    const heatingMode = document.getElementById("routine-heating-select")?.value || "heatpump";
    const city = AIR_QUALITY_DATA.cities[state.currentCity] || AIR_QUALITY_DATA.cities["delhi"];
    const profile = AIR_QUALITY_DATA.lifestyleProfiles[profileKey];

    const container = document.getElementById("routine-results-container");
    if (!container) return;

    // Build timeline blocks
    const timelineItems = [
        {
            time: "06:30 AM - 08:30 AM",
            title: "Morning Inversion Lockdown & Sleep Wakeup",
            badge: "Peak Smog Trap",
            badgeColor: "rose",
            desc: "The overnight thermal inversion layer is compressed at ~200 meters. Ground-level cold soot is at maximum concentration. Keep all windows and balcony doors strictly latched. Run the bedroom DIY Corsi-Rosenthal box or HEPA unit on medium.",
            impact: "Avoids 180 µg/m³ morning soot inhalation. 100% prevention of cold-air induced airway constriction."
        },
        {
            time: "08:30 AM - 09:45 AM",
            title: "Commute & School Transit Window",
            badge: commuteMode === "metro" ? "Green Transit" : (commuteMode === "carpool" ? "Shared Transit" : "Commute"),
            badgeColor: "cyan",
            desc: `Mode: ${commuteMode.toUpperCase()}. Child or commuter must wear a fitted pediatric/adult N95 mask. If in vehicle: mandatory AC 'Recirculation Mode' to block diesel exhaust from idling trucks. If taking Metro: avoid open elevated platforms during peak rush.`,
            impact: "Cuts toxic NO₂ and benzene exposure by 65% compared to open window or two-wheeler travel."
        },
        {
            time: "12:30 PM - 02:30 PM",
            title: "The Solar Window: Micro-Ventilation & Errands",
            badge: "Safe Solar Window",
            badgeColor: "emerald",
            desc: "Solar radiation creates vertical thermals that lift the smog ceiling. Open opposing windows for strictly 15 minutes to flush out indoor CO₂ (<750 ppm). Safe window for essential outdoor groceries or indoor play.",
            impact: "Flushes accumulated stale indoor CO₂ while preventing 90% of particulate soot accumulation."
        },
        {
            time: "05:00 PM - 07:00 PM",
            title: "Evening Return & Pre-Inversion Sealing",
            badge: "Caution Window",
            badgeColor: "amber",
            desc: "As the sun sets, ground temperatures drop rapidly and surface air chills, locking in evening commuter exhaust. Return indoors before 6:30 PM and close all dampers.",
            impact: "Avoids evening traffic corridor spikes of 500+ µg/m³ PM2.5."
        },
        {
            time: "07:30 PM - 10:30 PM",
            title: "Evening Hydro-Cleaning & Night Sanctuary",
            badge: "Indoor Sanctuary",
            badgeColor: "emerald",
            desc: `Wet-mop living area floors with warm water (no dry sweeping). Heating Mode: ${heatingMode === 'heatpump' ? 'Inverter Heat Pump (Clean Zero-Emission)' : 'Sealed Radiant Electric'}. Ensure Snake plants are in bedrooms to support nocturnal oxygen release.`,
            impact: "Eliminates particulate resuspension, cutting indoor PM2.5 down to under 25 µg/m³."
        }
    ];

    let html = `
      <div class="glass-panel p-6 space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-cyan-400">GenAI Synthesized Schedule</span>
            <h3 class="text-base font-bold text-white">${profile.title}</h3>
            <p class="text-xs text-slate-400">${profile.vulnerability}</p>
          </div>
          <div class="flex items-center space-x-2 text-xs">
            <span class="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
              Estimated 74% Particulate Inhalation Cut
            </span>
          </div>
        </div>

        <div class="relative border-l-2 border-slate-800 ml-3 space-y-6 pt-2">
    `;

    timelineItems.forEach(item => {
        let badgeBg = "bg-rose-950 text-rose-300 border-rose-800";
        if (item.badgeColor === "emerald") badgeBg = "bg-emerald-950 text-emerald-300 border-emerald-800";
        if (item.badgeColor === "cyan") badgeBg = "bg-cyan-950 text-cyan-300 border-cyan-800";
        if (item.badgeColor === "amber") badgeBg = "bg-amber-950 text-amber-300 border-amber-800";

        html += `
          <div class="relative pl-6">
            <div class="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-slate-900"></div>
            <div class="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <span class="text-xs font-bold text-white">${item.time}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${badgeBg}">${item.badge}</span>
              </div>
              <h4 class="text-xs font-semibold text-cyan-300">${item.title}</h4>
              <p class="text-xs text-slate-300 leading-relaxed">${item.desc}</p>
              <div class="pt-2 border-t border-slate-800/80 flex items-center space-x-2 text-[11px] text-emerald-400 font-medium">
                <i data-lucide="check-circle" class="w-3.5 h-3.5 shrink-0"></i>
                <span>Direct Impact: ${item.impact}</span>
              </div>
            </div>
          </div>
        `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
    initIcons();
}

// Corsi-Rosenthal Calculator
function updateCRBoxCalculator(roomArea) {
    const crRoomVal = document.getElementById("cr-room-val");
    const crAchVal = document.getElementById("cr-ach-val");
    const crTimeVal = document.getElementById("cr-time-val");

    if (!crRoomVal) return;

    // Room volume assuming 9 ft ceiling
    const volumeCuFt = roomArea * 9;
    const boxFanCfm = 580; // CFM for 4-filter MERV 13 box
    const ach = ((boxFanCfm * 60) / volumeCuFt).toFixed(1);
    
    // Time for 80% particle reduction (approx 2.3 time constants)
    const timeMinutes = Math.round((2.3 / (ach / 60)));

    crRoomVal.textContent = `${roomArea} sq. ft`;
    crAchVal.textContent = `${ach} ACH`;
    crTimeVal.textContent = `${timeMinutes} minutes`;
}

// Sustainable Alternatives & Impact Calculation
function setCommuteMode(mode) {
    state.commuteMode = mode;
    ["car", "carpool", "metro"].forEach(m => {
        const btn = document.getElementById(`btn-mode-${m}`);
        if (!btn) return;
        if (m === mode) {
            btn.className = "commute-mode-btn p-2 rounded-lg border border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold";
        } else {
            btn.className = "commute-mode-btn p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500";
        }
    });
    updateImpactCalculations();
}

function setHeatingMode(mode) {
    state.heatingMode = mode;
    const btnBio = document.getElementById("btn-heat-biomass");
    const btnClean = document.getElementById("btn-heat-clean");
    if (!btnBio || !btnClean) return;

    if (mode === "biomass") {
        btnBio.className = "heat-mode-btn p-2.5 rounded-lg border border-rose-500 bg-rose-950/40 text-rose-300 font-semibold";
        btnClean.className = "heat-mode-btn p-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400";
    } else {
        btnClean.className = "heat-mode-btn p-2.5 rounded-lg border border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold";
        btnBio.className = "heat-mode-btn p-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400";
    }
    updateImpactCalculations();
}

function setWasteMode(mode) {
    state.wasteMode = mode;
    const btnBurn = document.getElementById("btn-waste-burning");
    const btnComp = document.getElementById("btn-waste-compost");
    if (!btnBurn || !btnComp) return;

    if (mode === "burning") {
        btnBurn.className = "waste-mode-btn p-2.5 rounded-lg border border-rose-500 bg-rose-950/40 text-rose-300 font-semibold";
        btnComp.className = "waste-mode-btn p-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400";
    } else {
        btnComp.className = "waste-mode-btn p-2.5 rounded-lg border border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold";
        btnBurn.className = "waste-mode-btn p-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400";
    }
    updateImpactCalculations();
}

function updateImpactCalculations() {
    let co2SavedWeekly = 0;
    let pmInhaledAvoidedWeekly = 0;
    let score = 50;

    // Commute contribution
    const km = state.commuteKm;
    if (state.commuteMode === "metro") {
        co2SavedWeekly += km * 0.18 * 5 * 1.5; // kg
        pmInhaledAvoidedWeekly += km * 45; // micrograms
        score += 25;
    } else if (state.commuteMode === "carpool") {
        co2SavedWeekly += km * 0.12 * 5 * 1.2;
        pmInhaledAvoidedWeekly += km * 28;
        score += 18;
    } else {
        score -= 10;
    }

    // Heating contribution
    if (state.heatingMode === "clean") {
        co2SavedWeekly += 18.5;
        pmInhaledAvoidedWeekly += 420;
        score += 15;
    } else {
        score -= 20;
    }

    // Waste contribution
    if (state.wasteMode === "compost") {
        co2SavedWeekly += 8.2;
        pmInhaledAvoidedWeekly += 350;
        score += 10;
    } else {
        score -= 25;
    }

    score = Math.max(10, Math.min(100, score));
    const cigarettesAvoided = (pmInhaledAvoidedWeekly / 220).toFixed(1);

    const pmElem = document.getElementById("impact-pm-val");
    const cigElem = document.getElementById("impact-cig-val");
    const co2Elem = document.getElementById("impact-co2-val");
    const scoreValElem = document.getElementById("impact-score-val");
    const scoreBarElem = document.getElementById("impact-score-bar");

    if (pmElem) pmElem.textContent = `${Math.round(pmInhaledAvoidedWeekly).toLocaleString()} µg`;
    if (cigElem) cigElem.textContent = `(= ${cigarettesAvoided} cigarettes unsmoked)`;
    if (co2Elem) co2Elem.textContent = `${co2SavedWeekly.toFixed(1)} kg / week`;
    if (scoreValElem) scoreValElem.textContent = `${score} / 100`;
    if (scoreBarElem) scoreBarElem.style.width = `${score}%`;
}

// Community Actions
function handleHazardReport() {
    const type = document.getElementById("hazard-type").value;
    const loc = document.getElementById("hazard-loc").value;
    const desc = document.getElementById("hazard-desc").value;
    const feed = document.getElementById("community-feed-list");

    if (!loc) return;

    const newAlert = document.createElement("div");
    newAlert.className = "p-3 rounded-lg bg-slate-900/90 border border-rose-800/60 flex items-start justify-between text-xs fade-in";
    newAlert.innerHTML = `
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <span class="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[10px]">${type}</span>
          <span class="text-slate-300 font-medium">${loc}</span>
        </div>
        <p class="text-slate-200">${desc || 'Reported localized smog hazard. Neighbors cautioned to seal windows.'}</p>
      </div>
      <span class="text-[10px] text-cyan-400 shrink-0 font-medium">Just now</span>
    `;

    feed.prepend(newAlert);
    document.getElementById("hazard-report-form").reset();
    alert("✅ Neighborhood Alert Broadcasted! Nearby families have been notified.");
}

function handlePledgeToggle() {
    const btn = document.getElementById("btn-take-pledge");
    const text = document.getElementById("pledge-btn-text");

    if (!state.hasPledged) {
        state.hasPledged = true;
        state.pledgeCount += 1;
        btn.className = "px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 transition flex items-center space-x-1.5 shadow-md";
        text.textContent = "Pledge Active! ✓";
    } else {
        state.hasPledged = false;
        state.pledgeCount -= 1;
        btn.className = "px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shrink-0 transition flex items-center space-x-1.5 shadow-md";
        text.textContent = "Take Clean Air Pledge";
    }
}

// Live Chat & Gemini Integration
async function sendMessage(text) {
    if (!text || !text.trim()) return;

    const inputField = document.getElementById("chat-input-field");
    inputField.value = "";

    const container = document.getElementById("chat-messages-container");

    // Append User Message
    const userDiv = document.createElement("div");
    userDiv.className = "flex justify-end fade-in";
    userDiv.innerHTML = `
      <div class="chat-bubble-user p-3.5 max-w-xl text-xs leading-relaxed">
        ${escapeHtml(text)}
      </div>
    `;
    container.appendChild(userDiv);
    container.scrollTop = container.scrollHeight;

    // Append Loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "flex items-start space-x-3 fade-in";
    loadingDiv.id = "chat-loading-bubble";
    loadingDiv.innerHTML = `
      <div class="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
        <i data-lucide="bot" class="w-4 h-4"></i>
      </div>
      <div class="chat-bubble-bot p-3 text-xs text-slate-400 flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>AeroWise AI is analyzing air inversion dynamics and formulating guidance...</span>
      </div>
    `;
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;
    initIcons();

    // Call API or Fallback
    try {
        let aiMarkdown = "";
        if (state.apiKey) {
            aiMarkdown = await callLiveGeminiAPI(text);
        } else {
            // Built-in intelligent domain generator
            await new Promise(r => setTimeout(r, 600)); // natural responsiveness
            aiMarkdown = generateSmartAIResponse(text, state.currentCity);
        }

        // Remove loading
        const loader = document.getElementById("chat-loading-bubble");
        if (loader) loader.remove();

        // Render Bot Response
        const botDiv = document.createElement("div");
        botDiv.className = "flex items-start space-x-3 fade-in";
        botDiv.innerHTML = `
          <div class="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
            <i data-lucide="bot" class="w-4 h-4"></i>
          </div>
          <div class="chat-bubble-bot p-4 max-w-2xl text-xs space-y-2 leading-relaxed markdown-content">
            ${parseSimpleMarkdown(aiMarkdown)}
          </div>
        `;
        container.appendChild(botDiv);
        container.scrollTop = container.scrollHeight;
        initIcons();
    } catch (err) {
        const loader = document.getElementById("chat-loading-bubble");
        if (loader) loader.remove();

        const errorDiv = document.createElement("div");
        errorDiv.className = "flex items-start space-x-3 fade-in";
        errorDiv.innerHTML = `
          <div class="w-7 h-7 rounded-lg bg-rose-600/30 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
            <i data-lucide="alert-circle" class="w-4 h-4"></i>
          </div>
          <div class="chat-bubble-bot p-4 max-w-2xl text-xs text-rose-300">
            <strong>Connection Note:</strong> Unable to connect to Gemini API. Falling back to built-in smart assistant:
            <div class="markdown-content mt-2 text-slate-200">
              ${parseSimpleMarkdown(generateSmartAIResponse(text, state.currentCity))}
            </div>
          </div>
        `;
        container.appendChild(errorDiv);
        container.scrollTop = container.scrollHeight;
        initIcons();
    }
}

async function callLiveGeminiAPI(userQuery) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.selectedModel}:generateContent?key=${state.apiKey}`;
    
    const payload = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: `${GENAI_SYSTEM_PROMPT}\n\nCurrent Location: ${AIR_QUALITY_DATA.cities[state.currentCity].name} with AQI ${AIR_QUALITY_DATA.cities[state.currentCity].aqi}.\nUser Question: ${userQuery}` }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function askCopilotPreset(presetId) {
    const preset = PROMPT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    switchTab("copilot");
    sendMessage(preset.prompt);
}

// Markdown Parser Helper
function parseSimpleMarkdown(md) {
    if (!md) return "";
    let html = md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h3>$1</h3>')
        .replace(/^# (.*$)/gim, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>');

    // Wrap list items in ul
    html = html.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');
    // Paragraph breaks
    html = html.replace(/\n\n/g, '<br><br>');
    return html;
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Settings Modal & API Key Persistence
function initSettings() {
    const inputKey = document.getElementById("gemini-api-key-input");
    const selectModel = document.getElementById("gemini-model-select");
    const labelStatus = document.getElementById("api-status-label");
    const chatBadge = document.getElementById("chat-model-badge");

    if (inputKey && state.apiKey) {
        inputKey.value = state.apiKey;
    }
    if (selectModel && state.selectedModel) {
        selectModel.value = state.selectedModel;
    }

    if (state.apiKey) {
        if (labelStatus) labelStatus.textContent = "Gemini Live";
        if (chatBadge) chatBadge.textContent = "Gemini Live API";
    } else {
        if (labelStatus) labelStatus.textContent = "Built-in AI";
        if (chatBadge) chatBadge.textContent = "AI Domain Engine";
    }
}

function saveSettings() {
    const key = document.getElementById("gemini-api-key-input").value.trim();
    const model = document.getElementById("gemini-model-select").value;

    state.apiKey = key;
    state.selectedModel = model;

    localStorage.setItem("aerowise_gemini_api_key", key);
    localStorage.setItem("aerowise_gemini_model", model);

    initSettings();
    document.getElementById("settings-modal").classList.add("hidden");
    alert("✅ Settings saved successfully!");
}
