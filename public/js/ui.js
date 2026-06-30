(function () {
  "use strict";

  function getElements() {
    return {
      salaryInput: document.getElementById("inputSalaryHTML"),
      nationalInsurance: document.getElementById("nationalInsuranceHTML"),
      incomeTax: document.getElementById("incomeTaxHTML"),
      studentLoan: document.getElementById("studentLoanHTML"),
      pensionContribution: document.getElementById("pensionContributionHTML"),
      pensionInput: document.getElementById("inputPensionHTML"),
      pensionToggle: document.querySelector(".toggle-checkbox"),
      takeHomePay: document.getElementById("takeHomePayHTML"),
      calculateButton: document.getElementById("calculateButtonHTML"),
      clearButton: document.getElementById("clearButtonHTML"),
      plan1Button: document.querySelector(".plan1"),
      plan2Button: document.querySelector(".plan2"),
      timeButtons: document.querySelectorAll(".timeButton"),
      accordions: document.querySelectorAll("button.accordion"),
      chartCanvas: document.getElementById("pie-chart"),
      chartWrapper: document.getElementById("pieChartFade"),
    };
  }

  function setDefaultLabels(elements) {
    elements.nationalInsurance.textContent = "National Insurance:";
    elements.incomeTax.textContent = "Income Tax:";
    elements.studentLoan.textContent = "Student Loan:";
    elements.pensionContribution.textContent = "Pension Contribution:";
    elements.takeHomePay.textContent = "_________";
  }

  function setDeductionText(element, label, value) {
    element.textContent =
      value > 0
        ? label + ": " + window.Formatters.formatPounds(value)
        : label + ": £0";
  }

  function renderBreakdown(elements, breakdown) {
    setDeductionText(elements.incomeTax, "Income Tax", breakdown.incomeTax);
    setDeductionText(
      elements.nationalInsurance,
      "National Insurance",
      breakdown.nationalInsurance
    );
    setDeductionText(
      elements.pensionContribution,
      "Pension Contribution",
      breakdown.pensionContribution
    );
    setDeductionText(
      elements.studentLoan,
      "Student Loan",
      breakdown.studentLoan
    );
    elements.takeHomePay.textContent = window.Formatters.formatCurrency(
      breakdown.takeHomePay
    );
  }

  function setActiveStudentLoanPlan(elements, activePlan) {
    elements.plan1Button.classList.toggle("active", activePlan === "plan1");
    elements.plan2Button.classList.toggle("active", activePlan === "plan2");
  }

  function setActivePeriod(elements, activePeriod) {
    const activeText = window.TaxConfig.periods[activePeriod].buttonText;

    elements.timeButtons.forEach((button) => {
      button.classList.toggle("active", button.textContent.trim() === activeText);
    });
  }

  function getPeriodFromButton(button) {
    const buttonText = button.textContent.trim();

    return Object.keys(window.TaxConfig.periods).find(
      (period) => window.TaxConfig.periods[period].buttonText === buttonText
    );
  }

  function bindAccordions(elements) {
    elements.accordions.forEach((accordion) => {
      accordion.addEventListener("click", function () {
        accordion.classList.toggle("active");
        accordion.nextElementSibling.classList.toggle("show");
        elements.chartWrapper.classList.toggle("fade");
      });
    });
  }

  window.CalculatorUI = {
    bindAccordions,
    getElements,
    getPeriodFromButton,
    renderBreakdown,
    setActivePeriod,
    setActiveStudentLoanPlan,
    setDefaultLabels,
  };
})();
