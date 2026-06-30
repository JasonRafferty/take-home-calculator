(function () {
  "use strict";

  function createPieChart(canvas) {
    return new Chart(canvas, {
      type: "pie",
      data: {
        labels: window.TaxConfig.chart.labels,
        datasets: [
          {
            backgroundColor: window.TaxConfig.chart.colors,
            data: [0, 0, 0, 0, 0],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Pie Chart",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed || 0;

                return label + ": " + window.Formatters.formatPounds(value);
              },
            },
          },
        },
      },
    });
  }

  function getChartValues(breakdown) {
    if (!breakdown) {
      return [0, 0, 0, 0, 0];
    }

    return [
      breakdown.incomeTax,
      breakdown.nationalInsurance,
      breakdown.takeHomePay,
      breakdown.pensionContribution,
      breakdown.studentLoan,
    ];
  }

  function updatePieChart(chart, canvas, breakdown) {
    const dataValues = getChartValues(breakdown);

    chart.data.datasets[0].data = dataValues;
    canvas.style.display = dataValues.some((value) => value > 0)
      ? "block"
      : "none";
    chart.update();
  }

  window.ChartView = {
    createPieChart,
    updatePieChart,
  };
})();
