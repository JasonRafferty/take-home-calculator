(function () {
  "use strict";

  window.TaxConfig = {
    periods: {
      weekly: {
        buttonText: "Weekly",
        divisor: 52,
      },
      monthly: {
        buttonText: "Monthly",
        divisor: 12,
      },
      annually: {
        buttonText: "Annually",
        divisor: 1,
      },
    },
    chart: {
      labels: [
        "Income Tax",
        "National Insurance",
        "Take Home Pay",
        "Pension Contribution",
        "Student Loan",
      ],
      colors: ["#E3D3F0", "#AAC4FF", "#B1B2FF", "#D2DAFF", "#EEF1FF"],
    },
    incomeTaxBands: [
      { upTo: 12570, rate: 0 },
      { upTo: 50270, rate: 0.2 },
      { upTo: 125140, rate: 0.4 },
      { upTo: Infinity, rate: 0.45 },
    ],
    nationalInsuranceBands: [
      { upTo: 9880, rate: 0 },
      { upTo: 50270, rate: 0.12 },
      { upTo: Infinity, rate: 0.02 },
    ],
    studentLoanPlans: {
      plan1: {
        threshold: 22015,
        rate: 0.09,
      },
      plan2: {
        threshold: 27295,
        rate: 0.09,
      },
    },
  };
})();
