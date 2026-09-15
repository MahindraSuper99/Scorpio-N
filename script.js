// Configure this before going live: a webhook/endpoint that accepts a JSON POST
// of the survey answers (e.g. a Google Apps Script Web App URL, or your own API).
// Leave blank to keep responses local-only (useful for testing).
const SUBMIT_ENDPOINT = "";

const TOTAL_STEPS = 3;

const form = document.getElementById("survey-form");
const stepChrome = document.getElementById("step-chrome");
const screens = {
  welcome: document.getElementById("screen-welcome"),
  done: document.getElementById("screen-done"),
};
for (let i = 1; i <= TOTAL_STEPS; i++) {
  screens[i] = document.getElementById(`screen-${i}`);
}

const designationSelect = document.getElementById("designation");
const otherDesignationField = document.getElementById("otherDesignationField");
const otherDesignationInput = document.getElementById("otherDesignation");
const dealershipSelect = document.getElementById("dealership");

document.getElementById("year").textContent = new Date().getFullYear();

const CHECK_SVG = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 10 8 14 16 6"/></svg>';

function renderStepper(activeStep) {
  document.querySelectorAll(".step").forEach((el) => {
    const n = Number(el.dataset.step);
    const circle = el.querySelector(".step-circle");
    el.classList.remove("active", "completed");
    if (n < activeStep) {
      el.classList.add("completed");
      circle.innerHTML = CHECK_SVG;
    } else {
      circle.textContent = String(n);
      if (n === activeStep) el.classList.add("active");
    }
  });
  document.querySelectorAll(".step-bar").forEach((el) => {
    const n = Number(el.dataset.bar);
    el.classList.toggle("completed", activeStep > n);
  });
}

function goToStep(target) {
  screens.welcome.hidden = target !== "welcome";
  screens.done.hidden = target !== "done";
  form.hidden = target === "welcome" || target === "done";
  stepChrome.hidden = target === "welcome" || target === "done";

  for (let i = 1; i <= TOTAL_STEPS; i++) {
    screens[i].hidden = target !== i;
  }
  if (typeof target === "number") {
    renderStepper(target);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("start-btn").addEventListener("click", () => goToStep(1));

document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const step = Number(e.target.closest(".screen").dataset.stepScreen);
    goToStep(step - 1 === 0 ? 1 : step - 1);
  });
});

document.querySelectorAll("[data-next]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const section = e.target.closest(".screen");
    const step = Number(section.dataset.stepScreen);
    if (!validateStep(section)) return;
    goToStep(step + 1);
  });
});

designationSelect.addEventListener("change", () => {
  const isOther = designationSelect.value === "Other";
  otherDesignationField.hidden = !isOther;
  otherDesignationInput.required = isOther;
  if (isOther) otherDesignationInput.focus();
});

async function loadDealerList() {
  try {
    const res = await fetch("dealers.json");
    if (!res.ok) throw new Error("Failed to load dealer list");
    const dealers = await res.json();
    dealershipSelect.innerHTML = '<option value="" disabled selected>Select your dealership</option>';
    for (const dealer of dealers) {
      const opt = document.createElement("option");
      opt.value = dealer;
      opt.textContent = dealer;
      dealershipSelect.appendChild(opt);
    }
  } catch (err) {
    dealershipSelect.innerHTML = '<option value="" disabled selected>Could not load dealer list</option>';
    console.error(err);
  }
}
loadDealerList();

function validateStep(section) {
  const errorBox = section.querySelector(".form-error");
  section.querySelectorAll(".field").forEach((f) => f.classList.remove("invalid"));

  const fields = section.querySelectorAll("input, select");
  let valid = true;
  let firstInvalid = null;
  fields.forEach((el) => {
    if (!el.checkValidity()) {
      valid = false;
      if (!firstInvalid) firstInvalid = el;
      const field = el.closest(".field");
      if (field) field.classList.add("invalid");
    }
  });

  if (errorBox) errorBox.hidden = valid;
  if (!valid && firstInvalid) firstInvalid.focus();
  return valid;
}

function queueLocalSubmission(data) {
  try {
    const key = "scorpioN_rhino_survey_submissions";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push(data);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (err) {
    console.warn("Could not store submission locally", err);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const finalSection = document.getElementById("screen-3");
  if (!validateStep(finalSection)) return;

  const formData = new FormData(form);
  const data = {
    firstName: formData.get("firstName"),
    designation: formData.get("designation"),
    otherDesignation: formData.get("otherDesignation") || "",
    dealership: formData.get("dealership"),
    purchaseWithRoofRack: formData.get("purchaseWithRoofRack"),
    purchaseWithoutRoofRack: formData.get("purchaseWithoutRoofRack"),
    submittedAt: new Date().toISOString(),
  };

  queueLocalSubmission(data);

  if (SUBMIT_ENDPOINT) {
    try {
      await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error("Submission failed to send to server; kept locally.", err);
    }
  }

  goToStep("done");
});

goToStep("welcome");
