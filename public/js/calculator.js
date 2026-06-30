(function () {
  "use strict";

  function calculateBandDeduction(income, bands) {
    let previousLimit = 0;
    let total = 0;

    bands.some((band) => {
      const taxableAmount = Math.max(
        Math.min(income, band.upTo) - previousLimit,
        0
      );

      total += taxableAmount * band.rate;
      previousLimit = band.upTo;

      return income <= band.upTo;
    });

    return Math.round(total);
  }

  function calculateStudentLoan(income, plan) {
    if (!plan || income <= plan.threshold) {
      return 0;
    }

    return Math.round((income - plan.threshold) * plan.rate);
  }

  function calculateTakeHomePay(options) {
    const salary = Number(options.salary);
    const pensionPercentage = Number(options.pensionPercentage) || 0;
    const hasPensionContribution = Boolean(options.hasPensionContribution);
    const studentLoanPlan =
      window.TaxConfig.studentLoanPlans[options.studentLoanPlan] || null;

    if (!Number.isFinite(salary) || salary < 0) {
      return null;
    }

    const pensionContribution = hasPensionContribution
      ? Math.round(salary * (pensionPercentage / 100))
      : 0;
    const salaryAfterPension = salary - pensionContribution;
    const nationalInsurance = calculateBandDeduction(
      salaryAfterPension,
      window.TaxConfig.nationalInsuranceBands
    );
    const salaryAfterNationalInsurance =
      salaryAfterPension - nationalInsurance;
    const incomeTax = calculateBandDeduction(
      salaryAfterNationalInsurance,
      window.TaxConfig.incomeTaxBands
    );
    const salaryBeforeStudentLoan = salaryAfterNationalInsurance - incomeTax;
    const studentLoan = calculateStudentLoan(
      salaryBeforeStudentLoan,
      studentLoanPlan
    );
    const takeHomePay = salaryBeforeStudentLoan - studentLoan;

    return {
      grossSalary: Math.round(salary),
      takeHomePay: Math.round(takeHomePay),
      deductions: {
        incomeTax,
        nationalInsurance,
        pensionContribution,
        studentLoan,
      },
    };
  }

  function getPeriodBreakdown(calculation, period) {
    const divisor = window.TaxConfig.periods[period].divisor;
    const divide = (value) => Math.round(value / divisor);

    return {
      incomeTax: divide(calculation.deductions.incomeTax),
      nationalInsurance: divide(calculation.deductions.nationalInsurance),
      takeHomePay: divide(calculation.takeHomePay),
      pensionContribution: divide(calculation.deductions.pensionContribution),
      studentLoan: divide(calculation.deductions.studentLoan),
    };
  }

  function isBalanced(calculation) {
    const deductions = calculation.deductions;
    const total =
      calculation.takeHomePay +
      deductions.incomeTax +
      deductions.nationalInsurance +
      deductions.pensionContribution +
      deductions.studentLoan;

    return calculation.grossSalary === total;
  }

  window.TakeHomeCalculator = {
    calculateTakeHomePay,
    getPeriodBreakdown,
    isBalanced,
  };
})();
