/**
 * FWH calculator
 * Based on work by https://gist.github.com/Liath/f4c65891ad90f71ddf30
 *
 * Modernized and set with 2020 semi-monthly brackets
 *
 * TABLE 3—SEMIMONTHLY Payroll Period
 */
const annualTable = {
  s: [ // single or married filing separately
    { min: 0, percent: 0, base: 0 },
    { min: 3800, percent: 0.1, base: 0 },
    { min: 13675, percent: 0.12, base: 987.50 },
    { min: 43925, percent: 0.22, base: 4617.50 },
    { min: 89325, percent: 0.24, base: 14605.50 },
    { min: 167100, percent: 0.32, base: 33271.50 },
    { min: 211150, percent: 0.35, base: 47367.50 },
    { min: 522200, percent: 0.37, base: 156235.00 },
  ],
  m: [ // married
    { min: 0, percent: 0, base: 0 },
    { min: 11900, percent: 0.1, base: 0 },
    { min: 31650, percent: 0.12, base: 1975 },
    { min: 92150, percent: 0.22, base: 9235 },
    { min: 182950, percent: 0.24, base: 29211 },
    { min: 338500, percent: 0.32, base: 66543 },
    { min: 426600, percent: 0.35, base: 94735 },
    { min: 633950, percent: 0.37, base: 167307.50 },
  ],
  h: [ // head of household
    { min: 0, percent: 0, base: 0 },
    { min: 10050, percent: 0.1, base: 0 },
    { min: 24150, percent: 0.12, base: 1410 },
    { min: 63750, percent: 0.22, base: 6162 },
    { min: 95550, percent: 0.24, base: 13158 },
    { min: 173250, percent: 0.32, base: 31830 },
    { min: 217400, percent: 0.35, base: 45926 },
    { min: 528450, percent: 0.37, base: 154793.50 },
  ],
  sh: [ // single or married filing separately
    { min: 0, percent: 0, base: 0 },
    { min: 6200, percent: 0.1, base: 0 },
    { min: 11138, percent: 0.12, base: 493.75 },
    { min: 26263, percent: 0.22, base: 2308.75 },
    { min: 48963, percent: 0.24, base: 7302.75 },
    { min: 87850, percent: 0.32, base: 16635.75 },
    { min: 109875, percent: 0.35, base: 23683.75 },
    { min: 265400, percent: 0.37, base: 78117.50 },
  ],
  mh: [ // married
    { min: 0, percent: 0, base: 0 },
    { min: 12400, percent: 0.1, base: 0 },
    { min: 22275, percent: 0.12, base: 987.5 },
    { min: 52525, percent: 0.22, base: 4617.5 },
    { min: 97925, percent: 0.24, base: 14605.5 },
    { min: 175700, percent: 0.32, base: 33271.5 },
    { min: 219750, percent: 0.35, base: 47367.5 },
    { min: 323425, percent: 0.37, base: 83653.75 },
  ],
  hh: [ // head of household
    { min: 0, percent: 0, base: 0 },
    { min: 9325, percent: 0.1, base: 0 },
    { min: 16375, percent: 0.12, base: 705 },
    { min: 36175, percent: 0.22, base: 3081 },
    { min: 52075, percent: 0.24, base: 6579 },
    { min: 90975, percent: 0.32, base: 15915 },
    { min: 113000, percent: 0.35, base: 22963 },
    { min: 268525, percent: 0.37, base: 77396.75 },
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
