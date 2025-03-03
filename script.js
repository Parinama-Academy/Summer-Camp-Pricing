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
  "Week 12* (Aug 11 - 12, 2 days)",
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
    options: ["1-Day Pass", "3-Day Pass", "Weekly"],
  },
  {
    id: "days",
    question: "Select one or more days:",
    condition: (answers) => answers.passType === "1-Day Pass",
    options: days,
    max: days.length,
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
    question: "Select weeks:",
    condition: (answers) => answers.passType === "Weekly",
    options: weeks,
    max: weeks.length,
    extraText:
      "Promo available at $379 per week (Full-day) or $279 per week (Half-day) for 4+ weeks.\n\n* Not eligible for 4 week promo.\nCan be added onto the 4+ week promo but cannot be the 4th week.",
  },
  {
    id: "time",
    question: "Full-day (10 AM - 4 PM) or Half-day (10 AM - 1 PM)?",
    options: ["Full-day", "Half-day"],
  },
  {
    id: "earlyCheckin",
    question: "Early check-in? (+$50 per week, 9 AM)",
    options: ["Yes", "No"],
  },
  {
    id: "numKids",
    question:
      "How many kids are signing up? For each kid -$10 and for each week -$10",
    type: "number",
    render: (answers) => {
      let container = document.createElement("div");
      container.classList.add("number-input-container");

      let decreaseBtn = document.createElement("button");
      decreaseBtn.classList.add("number-btn");
      decreaseBtn.textContent = "-";
      decreaseBtn.onclick = (e) => {
        e.preventDefault();
        adjustNumberInput("numKids", -1);
      };

      let input = document.createElement("input");
      input.type = "number";
      input.classList.add("number-input");
      input.min = "1";
      input.value = answers["numKids"] || "1";
      input.onchange = (e) => handleInput("numKids", e.target.value);

      let increaseBtn = document.createElement("button");
      increaseBtn.classList.add("number-btn");
      increaseBtn.textContent = "+";
      increaseBtn.onclick = (e) => {
        e.preventDefault();
        adjustNumberInput("numKids", 1);
      };

      container.appendChild(decreaseBtn);
      container.appendChild(input);
      container.appendChild(increaseBtn);
      return container;
    },
  },
  {
    id: "returning",
    question: "Did they come last year? (-$10 per kid | -$10 per week)",
    options: ["Yes", "No"],
  },
];

const prices = {
  "1-Day Pass": { "Full-day": 89, "Half-day": 69 },
  "3-Day Pass": { "Full-day": 259, "Half-day": 199 },
  Weekly: { "Full-day": 429, "Half-day": 329 },
  "4-Week Promo": { "Full-day": 379, "Half-day": 279 },
  "Early Check-in": 50,
};

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
  }

  if (questionData.extraText) {
    let extraTextElement = document.createElement("p");
    extraTextElement.classList.add("promo-text");
    extraTextElement.innerHTML = questionData.extraText.replace(/\n/g, "<br>");
    questionContainer.appendChild(extraTextElement);
  }

  if (questionData.id === "numKids" && questionData.render) {
    questionContainer.appendChild(questionData.render(answers));
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

function handleInput(id, value, max, min) {
  if (id === "passType") {
    delete answers["days"];
    delete answers["weeks"];
  }

  if (id === "numKids" && (value <= 0 || isNaN(value))) {
    alert("You must enter a valid number of kids (greater than 0). ");
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
  renderQuestion();
}

function updateButtons() {
  let visibleQuestions = getVisibleQuestions();
  let questionData = visibleQuestions[currentStep];
  let currentAnswer = answers[questionData.id];

  nextBtn.disabled =
    questionData.id !== "numKids" &&
    (!currentAnswer ||
      (Array.isArray(currentAnswer) && currentAnswer.length === 0));
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
  let visibleQuestions = getVisibleQuestions();
  let questionData = visibleQuestions[currentStep];
  let currentAnswer = answers[questionData.id];

  if (
    questionData.id !== "numKids" &&
    (!currentAnswer ||
      (Array.isArray(currentAnswer) && currentAnswer.length === 0))
  ) {
    alert("Please answer the current question before proceeding.");
    return;
  }

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
  let siblingDiscount = numKids > 1 ? 10 : 0;
  let earlyCheckinCost = 50;

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
  let numDays = selectedDays.length;
  let numWeeks = selectedWeeks.length;
  let countableWeeks = selectedWeeks.filter(
    (week) => week !== "Week 12* (Aug 11 - 12, 2 days)"
  ).length;
  let useDiscountedRate = countableWeeks >= 4;
  let shortWeeks = [
    "Week 1 (May 27 - May 30, 4 days)",
    "Week 6 (June 30 - July 3, 4 days)",
    "Week 11 (Aug 4 - Aug 8, 4 days)",
  ];
  let week12 = "Week 12* (Aug 11 - 12, 2 days)";

  for (let i = 1; i <= numKids; i++) {
    let kidCost = 0;
    let breakdownText = `<li><strong>Child ${i}:</strong><ul>`;
    let weekBreakdown = {
      "2-day weeks": [],
      "4-day weeks": [],
      "5-day weeks": [],
    };

    if (passType && timeType) {
      if (passType === "1-Day Pass" || passType === "3-Day Pass") {
        let rateType = "1-Day Pass";
        let costPerDay = prices[rateType][timeType];

        if (numDays >= 3) {
          rateType = "3-Day Pass";
          let costForThreeDays = prices[rateType][timeType];
          let costPerThreeDays = costForThreeDays / 3;
          kidCost += costPerThreeDays * numDays;
          breakdownText += `<li>${numDays} Days at ${rateType} Rate ($${costPerThreeDays.toFixed(
            2
          )} each) - Total: $${(costPerThreeDays * numDays).toFixed(2)}</li>`;
        } else {
          kidCost += costPerDay * numDays;
          breakdownText += `<li>${numDays} Days at ${rateType} Rate ($${costPerDay} each) - Total: $${(
            costPerDay * numDays
          ).toFixed(2)}</li>`;
        }
      } else if (passType === "Weekly") {
        selectedWeeks.forEach((week) => {
          let weekCost = useDiscountedRate
            ? prices["4-Week Promo"][timeType]
            : prices["Weekly"][timeType];
          let discountLabel = useDiscountedRate
            ? " (4+ week discounted price)"
            : "";
          if (week === week12) {
            let adjustedCost = (weekCost * 2) / 5;
            weekBreakdown["2-day weeks"].push(
              `${week}: $${adjustedCost.toFixed(2)}${discountLabel}`
            );
            kidCost += adjustedCost;
          } else if (shortWeeks.includes(week)) {
            let adjustedCost = (weekCost * 4) / 5;
            weekBreakdown["4-day weeks"].push(
              `${week}: $${adjustedCost.toFixed(2)}${discountLabel}`
            );
            kidCost += adjustedCost;
          } else {
            weekBreakdown["5-day weeks"].push(
              `${week}: $${weekCost.toFixed(2)}${discountLabel}`
            );
            kidCost += weekCost;
          }
        });
      }
    }

    Object.keys(weekBreakdown).forEach((key) => {
      if (weekBreakdown[key].length > 0) {
        breakdownText += `<li><strong>${key.replace(
          " weeks",
          ""
        )}:</strong><ul><li>${weekBreakdown[key].join(
          "</li><li>"
        )}</li></ul></li>`;
      }
    });

    let applicableWeeks =
      passType === "Weekly" ? numWeeks : Math.ceil(numDays / 5);

    if (answers.returning === "Yes") {
      let discount = returningDiscount * applicableWeeks;
      kidCost -= discount;
      breakdownText += `<li>Returning Discount (-$${discount}) (-$10 per week per kid)</li>`;
    }

    if (numKids > 1) {
      let siblingDisc = siblingDiscount * (numKids - 1) * applicableWeeks;
      kidCost -= siblingDisc;
      breakdownText += `<li>Sibling Discount (-$${siblingDisc}) (-$10 per week per kid)</li>`;
    }

    total += kidCost;
    breakdownText += "</ul></li>";
    breakdown.push(breakdownText);
  }

  if (answers.earlyCheckin === "Yes") {
    let earlyCheckinTotal = 0;
    if (passType === "Weekly") {
      earlyCheckinTotal = selectedWeeks.reduce((sum, week) => {
        return (
          sum +
          (shortWeeks.includes(week)
            ? (4 / 5) * earlyCheckinCost
            : week === week12
            ? (2 / 5) * earlyCheckinCost
            : earlyCheckinCost)
        );
      }, 0);
    } else if (passType === "1-Day Pass" || passType === "3-Day Pass") {
      earlyCheckinTotal = (numDays / 5) * earlyCheckinCost;
    }
    total += earlyCheckinTotal;
    breakdown.push(
      `<li>Early Check-in: +$${earlyCheckinTotal.toFixed(
        2
      )} ($50 per full week or adjusted for selected days)</li>`
    );
  }

  questionContainer.innerHTML = `
    <h2>Total Cost: $${total.toFixed(2)}</h2>
    <h3>Itemized Bill:</h3>
    <ul>${breakdown.join(" ")}</ul>
    <button id="restart-btn">Restart</button>`;

  document.getElementById("restart-btn").onclick = () => location.reload();
}

renderQuestion();
