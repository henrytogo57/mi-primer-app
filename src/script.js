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
  let countdownTimer;

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

    countdownTimer = window.setInterval(() => {
      remaining -= 1;
      updateCountdown(Math.max(remaining, 0));

      if (remaining <= 0) {
        window.clearInterval(countdownTimer);
        setMissionState("complete");
        if (countdown) countdown.textContent = "T+ 00:00:00";
      } else if (remaining <= 5) {
        setMissionState("orbit");
      }
    }, 1000);
  });

  updateMissionData(document.querySelector("input[name='orbit']:checked")?.id || "orbit-leo");
});
