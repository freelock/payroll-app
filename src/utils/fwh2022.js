/**
 * FWH calculator
 * Based on work by https://gist.github.com/Liath/f4c65891ad90f71ddf30
 *
 * Modernized and set with 2022 semi-monthly brackets
 *
 * TABLE 3—SEMIMONTHLY Payroll Period
 */
const annualTable = {
  s: [ // single or married filing separately
    { min: 0, percent: 0, base: 0 },
    { min: 4350, percent: 0.1, base: 0 },
    { min: 14625, percent: 0.12, base: 1027.50 },
    { min: 46125, percent: 0.22, base: 4807.50 },
    { min: 93425, percent: 0.24, base: 15213.50 },
    { min: 174400, percent: 0.32, base: 34647.50 },
    { min: 220300, percent: 0.35, base: 49335.50 },
    { min: 544250, percent: 0.37, base: 162718.50 },
  ],
  m: [ // married
    { min: 0, percent: 0, base: 0 },
    { min: 13000, percent: 0.1, base: 0 },
    { min: 33550, percent: 0.12, base: 2055 },
    { min: 96550, percent: 0.22, base: 9615 },
    { min: 191150, percent: 0.24, base: 30427 },
    { min: 353100, percent: 0.32, base: 69295 },
    { min: 444900, percent: 0.35, base: 98671 },
    { min: 660850, percent: 0.37, base: 174253.50 },
  ],
  h: [ // head of household
    { min: 0, percent: 0, base: 0 },
    { min: 10800, percent: 0.1, base: 0 },
    { min: 25450, percent: 0.12, base: 1465 },
    { min: 66700, percent: 0.22, base: 6415 },
    { min: 99850, percent: 0.24, base: 13708 },
    { min: 180850, percent: 0.32, base: 33148 },
    { min: 226750, percent: 0.35, base: 47836 },
    { min: 550700, percent: 0.37, base: 161218.5 },
  ],
  sh: [ // single or married filing separately - multiple jobs
    { min: 0, percent: 0, base: 0 },
    { min: 6475, percent: 0.1, base: 0 },
    { min: 11613, percent: 0.12, base: 513.75 },
    { min: 27363, percent: 0.22, base: 2403.75 },
    { min: 51013, percent: 0.24, base: 7606.75 },
    { min: 91500, percent: 0.32, base: 17323.75 },
    { min: 114450, percent: 0.35, base: 24667.75 },
    { min: 276425, percent: 0.37, base: 81359.00 },
  ],
  mh: [ // married - multiple jobs
    { min: 0, percent: 0, base: 0 },
    { min: 12950, percent: 0.1, base: 0 },
    { min: 23225, percent: 0.12, base: 1027.50 },
    { min: 54725, percent: 0.22, base: 4807.50 },
    { min: 102025, percent: 0.24, base: 15213.50 },
    { min: 183000, percent: 0.32, base: 34647.50 },
    { min: 228900, percent: 0.35, base: 49335.50 },
    { min: 336875, percent: 0.37, base: 87126.75 },
  ],
  hh: [ // head of household - multiple jobs
    { min: 0, percent: 0, base: 0 },
    { min: 9700, percent: 0.1, base: 0 },
    { min: 17025, percent: 0.12, base: 732.50 },
    { min: 37650, percent: 0.22, base: 3207.5 },
    { min: 54225, percent: 0.24, base: 6854 },
    { min: 94725, percent: 0.32, base: 16574 },
    { min: 117675, percent: 0.35, base: 23918 },
    { min: 279650, percent: 0.37, base: 80609.25 },
  ],
};
const numPeriods = 24;
const allowance = 4300;
const fwh = (empRates, taxableIncome) => {
  let adjustedAnWage;
  let table;
  const allowances = empRates.FWH;
  const gross1c = taxableIncome * numPeriods;
  const {
    dependentDeductions = 0,
    otherIncome = 0,
    deductions = 0,
    extraWithholding = 0,
    multipleJobs = 0,
  } = empRates;

  // Step 1
  if (allowances.length === 2) { // 2019 or earlier W-4
    table = allowances.substring(0, 1).toLowerCase();
    const allow = allowances.substring(1);
    const deduct1k = allow * allowance;
    adjustedAnWage = gross1c - deduct1k;
  } else { // 2020 W-4
    table = allowances.substring(0, 1).toLowerCase();
    adjustedAnWage = gross1c + (1 * otherIncome);
    adjustedAnWage -= deductions;
    if (multipleJobs) {
      table += 'h';
    } else {
      adjustedAnWage -= (table === 'm' ? 12900 : 8600);
    }
  }
  if (adjustedAnWage < 0) {
    adjustedAnWage = 0;
  }

  // Step 2
  const { bracket } = annualTable[table].reduce((result, row) => {
    if (row.min <= adjustedAnWage) {
      // eslint-disable-next-line
      result.bracket = row;
    }
    return result;
  }, {});
  // at this point, bracket should contain our tax bracket
  let amount = ((adjustedAnWage - bracket.min) * bracket.percent) + bracket.base;
  amount /= numPeriods;

  // Step 3
  if (dependentDeductions) {
    amount -= (dependentDeductions / numPeriods);
    if (amount < 0) {
      amount = 0;
    }
  }

  if (extraWithholding) {
    amount += 1 * extraWithholding;
  }
  return amount;
};

export default fwh;
