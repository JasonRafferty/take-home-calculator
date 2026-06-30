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
  };

  function toBands(bands) {
    return bands.map((band) => ({
      upTo: band.upTo === null ? Infinity : band.upTo,
      rate: band.rate,
    }));
  }

  window.TaxConfig.loadBands = function loadBands() {
    return fetch("data/tax-bands.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch tax-bands.json: " + response.status);
        }

        return response.json();
      })
      .then((data) => {
        window.TaxConfig.taxYear = data.taxYear;
        window.TaxConfig.lastVerified = data.lastVerified;
        window.TaxConfig.incomeTaxBands = toBands(data.incomeTaxBands);
        window.TaxConfig.nationalInsuranceBands = toBands(
          data.nationalInsuranceBands
        );
        window.TaxConfig.studentLoanPlans = data.studentLoanPlans;
      });
  };
})();
