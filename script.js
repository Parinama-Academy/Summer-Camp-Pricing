const weeks = [
  "Week 1 (May 27 - May 30, 4 days)",
  "Week 2 (June 2 - June 6, 5 days)",
  "Week 3 (June 9 - June 13, 5 days)",
  "Week 4 (June 16 - June 20, 5 days)",
  "Week 5 (June 23 - June 27, 5 days)",
  "Week 6 (June 30 - July 3, 4 days)",
  "Week 7 (July 7 - July 11, 5 days)",
  "Week 8 (July 14 - July 18, 5 days)",
  "Week 9 (July 21 - July 25, 5 days)",
  "Week 10 (July 28 - Aug 1, 5 days)",
  "Week 11 (Aug 4 - Aug 8, 4 days)",
  "Week 12 (Aug 11 - Aug 12, 2 days)",
];

const days = [
  "May 27",
  "May 28",
  "May 29",
  "May 30",
  "June 2",
  "June 3",
  "June 4",
  "June 5",
  "June 6",
  "June 9",
  "June 10",
  "June 11",
  "June 12",
  "June 13",
  "June 16",
  "June 17",
  "June 18",
  "June 19",
  "June 20",
  "June 23",
  "June 24",
  "June 25",
  "June 26",
  "June 27",
  "June 30",
  "July 1",
  "July 2",
  "July 3",
  "July 7",
  "July 8",
  "July 9",
  "July 10",
  "July 11",
  "July 14",
  "July 15",
  "July 16",
  "July 17",
  "July 18",
  "July 21",
  "July 22",
  "July 23",
  "July 24",
  "July 25",
  "July 28",
  "July 29",
  "July 30",
  "July 31",
  "Aug 1",
  "Aug 4",
  "Aug 5",
  "Aug 6",
  "Aug 7",
  "Aug 8",
  "Aug 11",
  "Aug 12",
];

const questions = [
  {
    id: "passType",
    question: "What type of pass?",
    options: ["1-Day Pass", "3-Day Pass", "Weekly", "4-Week Promo"],
  },
  {
    id: "days",
    question: "Select a day:",
    condition: (answers) => answers.passType === "1-Day Pass",
    options: days,
  },
  {
    id: "days",
    question: "Select three days:",
    condition: (answers) => answers.passType === "3-Day Pass",
    options: days,
    max: 3,
  },
  {
    id: "weeks",
    question: "Select four weeks:",
    condition: (answers) => answers.passType === "4-Week Promo",
    options: weeks,
    max: 4,
  },
  {
    id: "weeks",
    question: "Select a week:",
    condition: (answers) => answers.passType === "Weekly",
    options: weeks,
  },
  {
    id: "time",
    question: "Full-day or Half-day?",
    options: ["Full-day", "Half-day"],
  },
  {
    id: "earlyCheckin",
    question: "Early check-in? (+$50, 9 AM)",
    options: ["Yes", "No"],
  },
  { id: "numKids", question: "How many kids are signing up?", type: "number" },
  {
    id: "returning",
    question: "Did they come last year? (-$10 per kid)",
    options: ["Yes", "No"],
  },
];

let currentStep = 0;
let answers = {};
const questionContainer = document.getElementById("question-container");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

function getVisibleQuestions() {
  return questions.filter((q) => !q.condition || q.condition(answers));
}

function renderQuestion() {
  let visibleQuestions = getVisibleQuestions();
  let questionData = visibleQuestions[currentStep];

  if (!questionData) return;

  questionContainer.innerHTML = `<label>${questionData.question}</label>`;

  if (questionData.options) {
    let container = document.createElement("div");
    container.classList.add("days-table");

    // Reset stored values if changing pass type
    if (questionData.id === "days" || questionData.id === "weeks") {
      resetSelectionIfPassChanged(questionData.id, questionData.max);
    }

    questionData.options.forEach((option) => {
      let input = document.createElement("input");
      input.type = questionData.max ? "checkbox" : "radio";
      input.name = questionData.id;
      input.value = option;
      input.id = option;
      input.checked =
        answers[questionData.id]?.includes(option) ||
        answers[questionData.id] === option;
      input.addEventListener("change", () =>
        handleInput(questionData.id, option, questionData.max)
      );

      let label = document.createElement("label");
      label.textContent = option;
      label.htmlFor = option;

      container.appendChild(input);
      container.appendChild(label);
    });

    questionContainer.appendChild(container);
  } else if (questionData.type === "number") {
    let container = document.createElement("div");
    container.classList.add("number-input-container");

    let decreaseBtn = document.createElement("button");
    decreaseBtn.classList.add("number-btn");
    decreaseBtn.textContent = "-";
    decreaseBtn.onclick = (e) => {
      e.preventDefault();
      adjustNumberInput(questionData.id, -1);
    };

    let input = document.createElement("input");
    input.type = "number";
    input.classList.add("number-input");
    input.min = "1";
    input.value = answers[questionData.id] || "1";
    input.onchange = (e) => handleInput(questionData.id, e.target.value);

    let increaseBtn = document.createElement("button");
    increaseBtn.classList.add("number-btn");
    increaseBtn.textContent = "+";
    increaseBtn.onclick = (e) => {
      e.preventDefault();
      adjustNumberInput(questionData.id, 1);
    };

    container.appendChild(decreaseBtn);
    container.appendChild(input);
    container.appendChild(increaseBtn);
    questionContainer.appendChild(container);
  }

  updateButtons();
  updateProgress();
}

function resetSelectionIfPassChanged(id, max) {
  if (!answers.passType || !answers[id]) return;

  let maxSelections = max || 1;
  let currentSelections = answers[id];

  if (
    Array.isArray(currentSelections) &&
    currentSelections.length > maxSelections
  ) {
    answers[id] = currentSelections.slice(0, maxSelections);
  } else if (!Array.isArray(currentSelections) && maxSelections === 1) {
    answers[id] = "";
  }
}

function adjustNumberInput(id, delta) {
  let input = document.querySelector(".number-input");
  let newValue = Math.max(1, parseInt(input.value) + delta);
  input.value = newValue;
  handleInput(id, newValue);
}

function handleInput(id, value, max) {
  if (id === "passType") {
    // Reset day/week selections when pass type changes
    delete answers["days"];
    delete answers["weeks"];
  }

  if (id === "numKids" && (value <= 0 || isNaN(value))) {
    alert("You must enter a valid number of kids (greater than 0).");
    return;
  }

  if (max) {
    answers[id] = answers[id] || [];
    if (answers[id].includes(value)) {
      answers[id] = answers[id].filter((v) => v !== value);
    } else {
      if (answers[id].length < max) {
        answers[id].push(value);
      } else {
        alert(`You can only select up to ${max} options.`);
      }
    }
  } else {
    answers[id] = value;
  }

  updateButtons();
}

function updateButtons() {
  let visibleQuestions = getVisibleQuestions();
  let questionData = visibleQuestions[currentStep];

  if (questionData.max && answers[questionData.id]?.length > questionData.max) {
    alert(`You can only select up to ${questionData.max} options.`);
    answers[questionData.id] = answers[questionData.id].slice(
      0,
      questionData.max
    );
    renderQuestion();
  }

  nextBtn.disabled =
    (!answers[questionData.id] && questionData.id !== "numKids") ||
    (questionData.max && answers[questionData.id]?.length !== questionData.max);

  prevBtn.disabled = currentStep === 0;
}

function updateProgress() {
  let visibleQuestions = getVisibleQuestions();
  let percent = ((currentStep + 1) / visibleQuestions.length) * 100;
  progressBar.style.width = percent + "%";
  progressText.textContent = `Step ${currentStep + 1} of ${
    visibleQuestions.length
  }`;
}

prevBtn.onclick = () => {
  currentStep--;
  renderQuestion();
};

nextBtn.onclick = () => {
  if (answers.numKids && (answers.numKids <= 0 || isNaN(answers.numKids))) {
    alert("You must enter a valid number of kids (greater than 0).");
    return;
  }

  let visibleQuestions = getVisibleQuestions();
  if (currentStep < visibleQuestions.length - 1) {
    currentStep++;
    renderQuestion();
  } else {
    calculateTotal();
  }
};

function calculateTotal() {
  let total = 0;
  let breakdown = [];
  let passType = answers.passType;
  let timeType = answers.time;
  let numKids = parseInt(answers.numKids) || 1;
  let returningDiscount = answers.returning === "Yes" ? 10 : 0;

  const prices = {
    "1-Day Pass": { "Full-day": 89, "Half-day": 69 },
    "3-Day Pass": { "Full-day": 259, "Half-day": 199 },
    Weekly: { "Full-day": 429, "Half-day": 329 },
    "4-Week Promo": { "Full-day": 379, "Half-day": 279 },
    "Early Check-in": 50, // Charged once per family
  };

  // Store unique selections
  let selectedDays = answers.days
    ? Array.isArray(answers.days)
      ? answers.days
      : [answers.days]
    : [];
  let selectedWeeks = answers.weeks
    ? Array.isArray(answers.weeks)
      ? answers.weeks
      : [answers.weeks]
    : [];

  for (let i = 1; i <= numKids; i++) {
    let kidCost = 0;
    let kidBreakdown = [];

    if (passType && timeType) {
      let baseCost = prices[passType][timeType];

      if (passType === "4-Week Promo") {
        baseCost *= 4;
      }

      kidCost += baseCost;
      kidBreakdown.push(`${passType} (${timeType}): $${baseCost}`);
    }

    if (answers.returning === "Yes") {
      kidCost -= returningDiscount;
      kidBreakdown.push(`Returning Discount: -$${returningDiscount}`);
    }

    total += kidCost;
    breakdown.push(
      `<li><strong>Child ${i}:</strong> <ul>${kidBreakdown
        .map((item) => `<li>${item}</li>`)
        .join("")}</ul></li>`
    );
  }

  // Charge early check-in once
  if (answers.earlyCheckin === "Yes") {
    total += prices["Early Check-in"];
    breakdown.push(
      `<li><strong>Early Check-in:</strong> $${prices["Early Check-in"]}</li>`
    );
  }

  // Display selected days or weeks
  if (selectedDays.length > 0) {
    breakdown.push(
      `<li><strong>Selected Days:</strong> ${selectedDays.join(", ")}</li>`
    );
  }

  if (selectedWeeks.length > 0) {
    breakdown.push(
      `<li><strong>Selected Weeks:</strong> ${selectedWeeks.join(", ")}</li>`
    );
  }

  questionContainer.innerHTML = `
    <h2>Total Cost: $${total}</h2>
    <h3>Itemized Bill:</h3>
    <ul>${breakdown.join("")}</ul>
    <button id="restart-btn">Restart</button>
  `;

  document.getElementById("restart-btn").onclick = () => location.reload();
  prevBtn.style.display = "none";
  nextBtn.style.display = "none";
}

renderQuestion();
