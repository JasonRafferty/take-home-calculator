(function () {
  "use strict";

  const elements = window.CalculatorUI.getElements();
  const chart = window.ChartView.createPieChart(elements.chartCanvas);
  const state = {
    activePeriod: "annually",
    activeStudentLoanPlan: null,
    lastCalculation: null,
  };

  function getPensionPercentage() {
    return window.Formatters.parsePercentageInput(elements.pensionInput.value) || 0;
  }

  function getSalary() {
    return window.Formatters.parseCurrencyInput(elements.salaryInput.value);
  }

  function renderCurrentPeriod() {
    if (!state.lastCalculation) {
      window.CalculatorUI.setDefaultLabels(elements);
      window.ChartView.updatePieChart(chart, elements.chartCanvas, null);
      return;
    }

    const breakdown = window.TakeHomeCalculator.getPeriodBreakdown(
      state.lastCalculation,
      state.activePeriod
    );

    window.CalculatorUI.renderBreakdown(elements, breakdown);
    window.ChartView.updatePieChart(chart, elements.chartCanvas, breakdown);
  }

  function calculate() {
    const salary = getSalary();

    if (salary === null) {
      state.lastCalculation = null;
      renderCurrentPeriod();
      return;
    }

    state.lastCalculation = window.TakeHomeCalculator.calculateTakeHomePay({
      salary,
      pensionPercentage: getPensionPercentage(),
      hasPensionContribution: elements.pensionToggle.checked,
      studentLoanPlan: state.activeStudentLoanPlan,
    });
    state.activePeriod = "annually";

    window.CalculatorUI.setActivePeriod(elements, state.activePeriod);
    renderCurrentPeriod();

    if (!window.TakeHomeCalculator.isBalanced(state.lastCalculation)) {
      console.warn("Calculation components do not add up to the gross salary.");
    }
  }

  function clearCalculator() {
    elements.salaryInput.value = "";
    elements.pensionInput.value = "";
    elements.pensionToggle.checked = false;
    state.activePeriod = "annually";
    state.activeStudentLoanPlan = null;
    state.lastCalculation = null;

    window.CalculatorUI.setActivePeriod(elements, state.activePeriod);
    window.CalculatorUI.setActiveStudentLoanPlan(
      elements,
      state.activeStudentLoanPlan
    );
    renderCurrentPeriod();
  }

  function checkSalaryInput(input) {
    window.Formatters.normaliseSalaryInput(input);
  }

  function checkPensionInput(input) {
    window.Formatters.normalisePensionInput(input);
  }

  function handleStudentLoanPlanChange(plan) {
    state.activeStudentLoanPlan =
      state.activeStudentLoanPlan === plan ? null : plan;

    window.CalculatorUI.setActiveStudentLoanPlan(
      elements,
      state.activeStudentLoanPlan
    );
    calculate();
  }

  function handlePeriodChange(button) {
    const selectedPeriod = window.CalculatorUI.getPeriodFromButton(button);

    if (!selectedPeriod || !state.lastCalculation) {
      return;
    }

    state.activePeriod = selectedPeriod;
    window.CalculatorUI.setActivePeriod(elements, state.activePeriod);
    renderCurrentPeriod();
  }

  function bindEvents() {
    elements.calculateButton.addEventListener("click", calculate);
    elements.clearButton.addEventListener("click", clearCalculator);
    elements.salaryInput.addEventListener("input", function () {
      checkSalaryInput(elements.salaryInput);
    });
    elements.salaryInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        calculate();
      }
    });
    elements.pensionInput.addEventListener("input", function () {
      checkPensionInput(elements.pensionInput);
      calculate();
    });
    elements.pensionToggle.addEventListener("change", function () {
      if (
        elements.pensionToggle.checked &&
        window.Formatters.parsePercentageInput(elements.pensionInput.value) === null
      ) {
        elements.pensionToggle.checked = false;
        return;
      }

      calculate();
    });
    elements.plan1Button.addEventListener("click", function () {
      handleStudentLoanPlanChange("plan1");
    });
    elements.plan2Button.addEventListener("click", function () {
      handleStudentLoanPlanChange("plan2");
    });
    elements.timeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        handlePeriodChange(button);
      });
    });
    window.CalculatorUI.bindAccordions(elements);
  }

  window.calculate = calculate;
  window.checkSalaryInput = checkSalaryInput;
  window.checkPensionInput = checkPensionInput;

  bindEvents();
  clearCalculator();
})();
