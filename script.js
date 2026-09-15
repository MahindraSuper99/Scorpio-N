// Configure this before going live: a webhook/endpoint that accepts a JSON POST
// of the survey answers (e.g. a Google Apps Script Web App URL, or your own API).
// Leave blank to keep responses local-only (useful for testing).
const SUBMIT_ENDPOINT = "";

const form = document.getElementById("survey-form");
const designationSelect = document.getElementById("designation");
const otherDesignationField = document.getElementById("otherDesignationField");
const dealershipSelect = document.getElementById("dealership");
const formError = document.getElementById("form-error");
const thankYou = document.getElementById("thank-you");

designationSelect.addEventListener("change", () => {
  otherDesignationField.hidden = designationSelect.value !== "Other";
  if (!otherDesignationField.hidden) {
    document.getElementById("otherDesignation").focus();
  }
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

  document.querySelectorAll(".field").forEach((f) => f.classList.remove("invalid"));

  if (!form.checkValidity()) {
    document.querySelectorAll(":invalid").forEach((el) => {
      const field = el.closest(".field");
      if (field) field.classList.add("invalid");
    });
    formError.hidden = false;
    const firstInvalid = form.querySelector(":invalid");
    if (firstInvalid) firstInvalid.focus();
    return;
  }
  formError.hidden = true;

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

  form.hidden = true;
  thankYou.hidden = false;
  thankYou.scrollIntoView({ behavior: "smooth" });
});
