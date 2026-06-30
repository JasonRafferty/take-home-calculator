(function () {
  "use strict";

  const currencyFormatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const numberFormatter = new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0,
  });

  function parseCurrencyInput(value) {
    const numericValue = String(value).replace(/[^\d.]/g, "");
    const parsedValue = Number.parseFloat(numericValue);

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  function parsePercentageInput(value) {
    const parsedValue = Number.parseFloat(value);

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  function clampPercentage(value) {
    if (!Number.isFinite(value)) {
      return null;
    }

    return Math.min(Math.max(value, 0), 100);
  }

  function formatCurrency(value) {
    return currencyFormatter.format(Math.round(Number(value) || 0));
  }

  function formatPounds(value) {
    return "£" + numberFormatter.format(Math.round(Number(value) || 0));
  }

  function normaliseSalaryInput(input) {
    const salary = parseCurrencyInput(input.value);

    if (salary === null) {
      input.value = "";
      return null;
    }

    input.value = formatPounds(salary);
    return salary;
  }

  function normalisePensionInput(input) {
    const percentage = clampPercentage(parsePercentageInput(input.value));

    if (percentage === null) {
      input.value = "";
      return null;
    }

    input.value = percentage;
    return percentage;
  }

  window.Formatters = {
    clampPercentage,
    formatCurrency,
    formatPounds,
    normalisePensionInput,
    normaliseSalaryInput,
    parseCurrencyInput,
    parsePercentageInput,
  };
})();
