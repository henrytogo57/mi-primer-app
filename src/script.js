document.addEventListener("DOMContentLoaded", () => {
  const orbitData = {
    "orbit-leo": { altitude: "400", speed: "7.67", distance: "1.240", fuel: 68 },
    "orbit-meo": { altitude: "20.200", speed: "3.87", distance: "4.860", fuel: 54 },
    "orbit-geo": { altitude: "35.786", speed: "3.07", distance: "8.920", fuel: 39 }
  };

  const missionStatus = document.querySelector(".mission-status");
  const fuelValue = document.querySelector(".fuel-readout strong");
  const fuelBar = document.querySelector(".fuel-bar i");
  const metricAltitude = document.querySelector(".flight-metrics div:nth-child(1) strong");
  const metricSpeed = document.querySelector(".flight-metrics div:nth-child(2) strong");
  const metricDistance = document.querySelector(".flight-metrics div:nth-child(3) strong");
  const countdown = document.querySelector(".countdown strong");
  const launchButton = document.querySelector(".mission-builder .primary-button");
  const missionForm = document.querySelector("#mission-form");
  const destinationInput = document.querySelector("#destination");
  const propulsionInput = document.querySelector("#sim-propulsion");
  const orbitInput = document.querySelector("#sim-orbit");
  const massInput = document.querySelector("#mass");
  const distanceInput = document.querySelector("#distance");
  const simulationFuelInput = document.querySelector("#sim-fuel");
  const simulationState = document.querySelector("#sim-state");
  const simulationSpeed = document.querySelector("#sim-speed");
  const simulationRemaining = document.querySelector("#sim-remaining");
  const simulationTime = document.querySelector("#sim-time");
  const simulationMass = document.querySelector("#sim-mass");
  const simulationMessage = document.querySelector("#sim-message");
  const targetPlanet = document.querySelector("#target-planet");
  let countdownTimer;

  const simulationData = {
    luna: { distance: 384400, speed: 10.9, days: 3, color: "#c47e65" },
    marte: { distance: 225000000, speed: 11.6, days: 210, color: "#b76250" },
    europa: { distance: 628000000, speed: 14.3, days: 900, color: "#b7d5d5" }
  };

  const propulsionFactor = { chemical: 1, electric: .72, nuclear: .86 };
  const orbitFactor = { leo: 1, meo: .91, geo: .84 };
  const formatNumber = (value) => new Intl.NumberFormat("es-ES").format(Math.round(value));

  const setMissionState = (state) => {
    if (missionStatus) {
      missionStatus.dataset.state = state;
    }
  };

  const updateMissionData = (orbitId) => {
    const data = orbitData[orbitId];
    if (!data) return;

    if (metricAltitude) metricAltitude.innerHTML = `${data.altitude}<span> km</span>`;
    if (metricSpeed) metricSpeed.innerHTML = `${data.speed}<span> km/s</span>`;
    if (metricDistance) metricDistance.innerHTML = `${data.distance}<span> km</span>`;
    if (fuelValue) fuelValue.textContent = `${data.fuel}%`;
    if (fuelBar) fuelBar.style.width = `${data.fuel}%`;
    setMissionState("preparing");
  };

  const updateRangeLabels = () => {
    const massOutput = document.querySelector("#mass-output");
    const distanceOutput = document.querySelector("#distance-output");
    const fuelOutput = document.querySelector("#fuel-output");
    if (massOutput && massInput) massOutput.textContent = `${formatNumber(massInput.value)} kg`;
    if (distanceOutput && distanceInput) distanceOutput.textContent = `${formatNumber(distanceInput.value)} km`;
    if (fuelOutput && simulationFuelInput) fuelOutput.textContent = `${simulationFuelInput.value}%`;
  };

  const runSimulation = () => {
    if (!destinationInput || !propulsionInput || !orbitInput) return;
    const destination = simulationData[destinationInput.value];
    const mass = Number(massInput?.value || 12000);
    const distance = Number(distanceInput?.value || destination.distance);
    const availableFuel = Number(simulationFuelInput?.value || 68);
    const speed = destination.speed * propulsionFactor[propulsionInput.value] * orbitFactor[orbitInput.value];
    const distanceRatio = Math.max(distance / destination.distance, .35);
    const requiredFuel = Math.min(98, Math.round((mass / 12000) * distanceRatio * 38 / propulsionFactor[propulsionInput.value]));
    const remainingFuel = Math.max(0, availableFuel - requiredFuel);
    const viable = availableFuel >= requiredFuel && distance <= destination.distance * 1.15;
    const travelDays = Math.max(1, Math.round(destination.days * distanceRatio / propulsionFactor[propulsionInput.value]));

    if (simulationState) simulationState.textContent = viable ? "MISIÓN VIABLE" : "AJUSTAR RECURSOS";
    if (simulationState) simulationState.dataset.valid = viable;
    if (simulationSpeed) simulationSpeed.textContent = `${speed.toFixed(1)} km/s`;
    if (simulationRemaining) simulationRemaining.textContent = `${remainingFuel}%`;
    if (simulationTime) simulationTime.textContent = travelDays >= 365 ? `${(travelDays / 365).toFixed(1)} años` : `${travelDays} días`;
    if (simulationMass) simulationMass.textContent = `${formatNumber(mass)} kg`;
    if (simulationMessage) simulationMessage.textContent = viable ? `Trayectoria confirmada hacia ${destinationInput.options[destinationInput.selectedIndex].text}. Todos los sistemas dentro de parámetros.` : "La misión necesita más combustible, menos masa o una propulsión más eficiente.";
    if (targetPlanet) targetPlanet.style.background = `radial-gradient(circle at 35% 30%, #f0d2a3, ${destination.color} 55%, #071827)`;
  };

  document.querySelectorAll("input[name='orbit']").forEach((input) => {
    input.addEventListener("change", () => updateMissionData(input.id));
  });

  document.querySelectorAll("input[name='speed']").forEach((input) => {
    input.addEventListener("change", () => {
      const speed = input.id === "speed-low" ? "7.67" : input.id === "speed-mid" ? "3.87" : "3.07";
      if (metricSpeed) metricSpeed.innerHTML = `${speed}<span> km/s</span>`;
      setMissionState("orbit");
    });
  });

  document.querySelectorAll(".timeline-entry").forEach((entry) => {
    const selectTimelineEntry = () => {
      document.querySelectorAll(".timeline-entry").forEach((item) => {
        const isSelected = item === entry;
        item.classList.toggle("timeline-entry-active", isSelected);
        item.setAttribute("aria-pressed", String(isSelected));
      });
      document.querySelectorAll(".compare-card").forEach((card) => {
        card.classList.toggle("compare-card-active", card.dataset.compare === entry.dataset.mission);
      });
    };
    entry.addEventListener("click", selectTimelineEntry);
    entry.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectTimelineEntry();
      }
    });
  });

  document.querySelectorAll(".compare-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelector(`.timeline-entry[data-mission="${card.dataset.compare}"]`)?.click();
    });
  });

  document.querySelectorAll(".radar-point").forEach((point, index) => {
    point.setAttribute("tabindex", "0");
    point.addEventListener("click", () => {
      document.querySelectorAll(".radar-point").forEach((item) => item.classList.remove("radar-point-selected"));
      point.classList.add("radar-point-selected");
      const radarLabel = document.querySelector(".radar-data span");
      const radarValue = document.querySelector(".radar-data strong");
      const radarLink = document.querySelector(".radar-data small");
      if (radarLabel) radarLabel.textContent = `TARGET / 0${index + 1}`;
      if (radarValue) radarValue.textContent = `${98 - index * 7}.4%`;
      if (radarLink) radarLink.textContent = "SIGNAL LOCKED / 12 MS";
    });
  });

  [massInput, distanceInput, simulationFuelInput].forEach((input) => input?.addEventListener("input", updateRangeLabels));
  [destinationInput, propulsionInput, orbitInput].forEach((input) => input?.addEventListener("change", runSimulation));
  missionForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    runSimulation();
    simulationState?.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 500, iterations: 2 });
  });

  document.querySelectorAll(".propulsion-card").forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-pressed", card.classList.contains("propulsion-card-active") ? "true" : "false");

    const activateCard = () => {
      document.querySelectorAll(".propulsion-card").forEach((item) => {
        item.classList.remove("propulsion-card-active");
        item.setAttribute("aria-pressed", "false");
      });
      card.classList.add("propulsion-card-active");
      card.setAttribute("aria-pressed", "true");
    };

    card.addEventListener("click", activateCard);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateCard();
      }
    });
  });

  const updateCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const remainder = (seconds % 60).toString().padStart(2, "0");
    if (countdown) countdown.textContent = `T- 00:${minutes}:${remainder}`;
  };

  launchButton?.addEventListener("click", (event) => {
    event.preventDefault();
    window.clearInterval(countdownTimer);
    let remaining = 10;
    updateCountdown(remaining);
    setMissionState("preparing");
    document.body.classList.add("launching");

    countdownTimer = window.setInterval(() => {
      remaining -= 1;
      updateCountdown(Math.max(remaining, 0));

      if (remaining <= 0) {
        window.clearInterval(countdownTimer);
        setMissionState("complete");
        document.body.classList.remove("launching");
        if (countdown) countdown.textContent = "T+ 00:00:00";
      } else if (remaining <= 5) {
        setMissionState("orbit");
      }
    }, 1000);
  });

  updateMissionData(document.querySelector("input[name='orbit']:checked")?.id || "orbit-leo");
  updateRangeLabels();
  runSimulation();
});
