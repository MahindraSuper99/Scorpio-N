// Configure this before going live: a webhook/endpoint that accepts a JSON POST
// of the survey answers (e.g. a Google Apps Script Web App URL, or your own API).
// Leave blank to keep responses local-only (useful for testing).
const SUBMIT_ENDPOINT = "";

const VAT_RATE = 0.15;

const ACCESSORIES = [
  { id: "roofRack", name: "Heavy-Duty Roof Rack", price: 13000 },
  { id: "towbar", name: "Towbar", price: 6900 },
  { id: "tyres", name: "265/60R All Terrain Tyre (5)", price: 25000 },
  { id: "alloys", name: "Matte Black Alloy Wheels", price: 7000 },
  { id: "drawerSystem", name: "Premium Drawer Storage System", price: 30000 },
  { id: "nudgeBar", name: "Nudge Bar", price: 5000 },
  { id: "brakeCalipers", name: "Red Brake Calipers", price: 4000 },
  { id: "fridge", name: "Portable Car Fridge", price: 7000 },
  { id: "dualBattery", name: "Dual-Battery System", price: 17000 },
  { id: "mudTrack", name: "Heavy-Duty Mud Track (With Bracket)", price: 10000 },
  { id: "jerryCans", name: "Heavy-Duty Jerry Cans", price: 3000 },
  { id: "awningTent", name: "270 Awning Tent", price: 20000 },
];

const TOTAL_STEPS = 2;

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
const provinceSelect = document.getElementById("province");
const dealershipSelect = document.getElementById("dealership");

document.getElementById("year").textContent = new Date().getFullYear();

function formatRand(n) {
  return "R" + Math.round(n).toLocaleString("en-US");
}

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

let dealersByProvince = {};

async function loadDealerData() {
  try {
    const res = await fetch("dealers.json");
    if (!res.ok) throw new Error("Failed to load dealer list");
    dealersByProvince = await res.json();
    provinceSelect.innerHTML = '<option value="" disabled selected>Select your province</option>';
    for (const province of Object.keys(dealersByProvince)) {
      const opt = document.createElement("option");
      opt.value = province;
      opt.textContent = province;
      provinceSelect.appendChild(opt);
    }
  } catch (err) {
    provinceSelect.innerHTML = '<option value="" disabled selected>Could not load province list</option>';
    console.error(err);
  }
}
loadDealerData();

provinceSelect.addEventListener("change", () => {
  const dealers = dealersByProvince[provinceSelect.value] || [];
  dealershipSelect.innerHTML = '<option value="" disabled selected>Select your dealership</option>';
  for (const dealer of dealers) {
    const opt = document.createElement("option");
    opt.value = dealer;
    opt.textContent = dealer;
    dealershipSelect.appendChild(opt);
  }
  dealershipSelect.disabled = dealers.length === 0;
});

function renderAccessoryTable() {
  const tbody = document.getElementById("accessory-rows");
  tbody.innerHTML = "";
  ACCESSORIES.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" id="acc-${item.id}" name="accessories" value="${item.name}" data-price="${item.price}"></td>
      <td><label for="acc-${item.id}">${item.name}</label></td>
      <td>${formatRand(item.price)}</td>
    `;
    tbody.appendChild(tr);
  });

  const fullSubtotal = ACCESSORIES.reduce((sum, item) => sum + item.price, 0);
  document.getElementById("accessory-full-total").textContent = formatRand(fullSubtotal * (1 + VAT_RATE));

  tbody.addEventListener("change", updateSelectionSummary);
  updateSelectionSummary();
}

function updateSelectionSummary() {
  const checked = document.querySelectorAll('#accessory-rows input[type="checkbox"]:checked');
  const subtotal = Array.from(checked).reduce((sum, el) => sum + Number(el.dataset.price), 0);
  document.getElementById("selection-count").textContent = String(checked.length);
  document.getElementById("selection-subtotal").textContent = formatRand(subtotal);
  document.getElementById("selection-total-vat").textContent = formatRand(subtotal * (1 + VAT_RATE));
}

function renderScaleGroup() {
  const group = document.getElementById("scale-group");
  group.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const label = document.createElement("label");
    label.className = "toggle-btn";
    label.innerHTML = `<input type="radio" name="stockConsideration" value="${i}"${i === 1 ? " required" : ""}><span>${i}</span>`;
    group.appendChild(label);
  }
}

renderAccessoryTable();
renderScaleGroup();

function validateStep(section) {
  const errorBox = section.querySelector(".form-error");
  section.querySelectorAll(".field").forEach((f) => f.classList.remove("invalid"));

  const fields = section.querySelectorAll("input, select, textarea");
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

  const finalSection = document.getElementById("screen-2");
  if (!validateStep(finalSection)) return;

  const formData = new FormData(form);
  const selectedAccessories = formData.getAll("accessories");
  const accessorySubtotal = ACCESSORIES
    .filter((item) => selectedAccessories.includes(item.name))
    .reduce((sum, item) => sum + item.price, 0);

  const data = {
    fullName: formData.get("fullName"),
    designation: formData.get("designation"),
    otherDesignation: formData.get("otherDesignation") || "",
    province: formData.get("province"),
    dealership: formData.get("dealership"),
    selectedAccessories,
    accessorySubtotalExclVat: accessorySubtotal,
    accessoryTotalInclVat: Math.round(accessorySubtotal * (1 + VAT_RATE)),
    stockConsideration: formData.get("stockConsideration"),
    comments: formData.get("comments") || "",
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
