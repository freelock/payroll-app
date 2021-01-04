/**
 * FWH calculator
 * Based on work by https://gist.github.com/Liath/f4c65891ad90f71ddf30
 *
 * Modernized and set with 2021 semi-monthly brackets
 *
 * TABLE 3—SEMIMONTHLY Payroll Period
 */
const annualTable = {
  s: [ // single or married filing separately
    { min: 0, percent: 0, base: 0 },
    { min: 3950, percent: 0.1, base: 0 },
    { min: 13900, percent: 0.12, base: 995.00 },
    { min: 44475, percent: 0.22, base: 4664.00 },
    { min: 90325, percent: 0.24, base: 14751.00 },
    { min: 168875, percent: 0.32, base: 33603.00 },
    { min: 213375, percent: 0.35, base: 47843.00 },
    { min: 527550, percent: 0.37, base: 157804.25 },
  ],
  m: [ // married
    { min: 0, percent: 0, base: 0 },
    { min: 12200, percent: 0.1, base: 0 },
    { min: 32100, percent: 0.12, base: 1990 },
    { min: 93250, percent: 0.22, base: 9328 },
    { min: 184950, percent: 0.24, base: 29502 },
    { min: 342050, percent: 0.32, base: 67206 },
    { min: 431050, percent: 0.35, base: 95686 },
    { min: 640500, percent: 0.37, base: 168993.50 },
  ],
  h: [ // head of household
    { min: 0, percent: 0, base: 0 },
    { min: 10200, percent: 0.1, base: 0 },
    { min: 24400, percent: 0.12, base: 1420 },
    { min: 64400, percent: 0.22, base: 6220 },
    { min: 96550, percent: 0.24, base: 13293 },
    { min: 175100, percent: 0.32, base: 32145 },
    { min: 219600, percent: 0.35, base: 46385 },
    { min: 553800, percent: 0.37, base: 156355 },
  ],
  sh: [ // single or married filing separately
    { min: 0, percent: 0, base: 0 },
    { min: 6275, percent: 0.1, base: 0 },
    { min: 11250, percent: 0.12, base: 497.50 },
    { min: 26538, percent: 0.22, base: 2332 },
    { min: 49463, percent: 0.24, base: 7375.50 },
    { min: 88738, percent: 0.32, base: 16801.50 },
    { min: 110998, percent: 0.35, base: 23921.50 },
    { min: 268075, percent: 0.37, base: 78902.13 },
  ],
  mh: [ // married
    { min: 0, percent: 0, base: 0 },
    { min: 12550, percent: 0.1, base: 0 },
    { min: 22500, percent: 0.12, base: 995 },
    { min: 53075, percent: 0.22, base: 4664 },
    { min: 98925, percent: 0.24, base: 14751 },
    { min: 177475, percent: 0.32, base: 33603 },
    { min: 221975, percent: 0.35, base: 47843 },
    { min: 326700, percent: 0.37, base: 84496.75 },
  ],
  hh: [ // head of household
    { min: 0, percent: 0, base: 0 },
    { min: 9400, percent: 0.1, base: 0 },
    { min: 16500, percent: 0.12, base: 710 },
    { min: 36500, percent: 0.22, base: 3110 },
    { min: 52575, percent: 0.24, base: 6646.5 },
    { min: 91850, percent: 0.32, base: 16072.5 },
    { min: 114100, percent: 0.35, base: 23192.5 },
    { min: 271200, percent: 0.37, base: 78177.5 },
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
