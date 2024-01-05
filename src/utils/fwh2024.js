/**
 * FWH calculator
 * Based on work by https://gist.github.com/Liath/f4c65891ad90f71ddf30
 *
 * Publication P15t for tax rates
 *
 * Modernized and set with 2022 semi-monthly brackets
 *
 * TABLE 3—SEMIMONTHLY Payroll Period
 */
const semimonthlyTable = {
  s: [ // single or married filing separately
    { min: 0, percent: 0, base: 0 },
    { min: 608, percent: 0.1, base: 0 },
    { min: 1092, percent: 0.12, base: 48.40 },
    { min: 2573, percent: 0.22, base: 226.12 },
    { min: 4797, percent: 0.24, base: 715.4 },
    { min: 8606, percent: 0.32, base: 1629.56 },
    { min: 10764, percent: 0.35, base: 2320.12 },
    { min: 25998, percent: 0.37, base: 7652.02 },
  ],
  m: [ // married
    { min: 0, percent: 0, base: 0 },
    { min: 1217, percent: 0.1, base: 0 },
    { min: 2183, percent: 0.12, base: 96.60 },
    { min: 5146, percent: 0.22, base: 452.16 },
    { min: 9594, percent: 0.24, base: 1430.72 },
    { min: 17213, percent: 0.32, base: 3259.28 },
    { min: 21527, percent: 0.35, base: 4639.76 },
    { min: 31683, percent: 0.37, base: 8194.36 },
  ],
  h: [ // head of household
    { min: 0, percent: 0, base: 0 },
    { min: 913, percent: 0.1, base: 0 },
    { min: 1602, percent: 0.12, base: 68.90 },
    { min: 3542, percent: 0.22, base: 301.70 },
    { min: 5100, percent: 0.24, base: 644.46 },
    { min: 8910, percent: 0.32, base: 1558.86 },
    { min: 11067, percent: 0.35, base: 2249.10 },
    { min: 26302, percent: 0.37, base: 7581.35 },
  ],
  sh: [ // single or married filing separately - multiple jobs
    { min: 0, percent: 0, base: 0 },
    { min: 304, percent: 0.1, base: 0 },
    { min: 546, percent: 0.12, base: 24.20 },
    { min: 1266, percent: 0.22, base: 113 },
    { min: 2398, percent: 0.24, base: 357.64 },
    { min: 4303, percent: 0.32, base: 814.84 },
    { min: 5382, percent: 0.35, base: 1160.12 },
    { min: 12999, percent: 0.37, base: 3826.07 },
  ],
  mh: [ // married - multiple jobs
    { min: 0, percent: 0, base: 0 },
    { min: 608, percent: 0.1, base: 0 },
    { min: 1092, percent: 0.12, base: 48.4 },
    { min: 2573, percent: 0.22, base: 226.12 },
    { min: 4797, percent: 0.24, base: 715.40 },
    { min: 8606, percent: 0.32, base: 1629.56 },
    { min: 10764, percent: 0.35, base: 2320.12 },
    { min: 15842, percent: 0.37, base: 4097.42 },
  ],
  hh: [ // head of household - multiple jobs
    { min: 0, percent: 0, base: 0 },
    { min: 456, percent: 0.1, base: 0 },
    { min: 801, percent: 0.12, base: 34.5 },
    { min: 1771, percent: 0.22, base: 150.9 },
    { min: 2550, percent: 0.24, base: 322.28 },
    { min: 4455, percent: 0.32, base: 779.48 },
    { min: 5533, percent: 0.35, base: 1124.44 },
    { min: 13151, percent: 0.37, base: 3790.74 },
  ],
  s2: [ // pre-2019 single
    { min: 0, percent: 0, base: 0 },
    { min: 250, percent: 0.1, base: 0 },
    { min: 733, percent: 0.12, base: 48.3 },
    { min: 2215, percent: 0.22, base: 226.14 },
  ],
  m2: [ // pre-2019 married
    { min: 0, percent: 0, base: 0 },
    { min: 679, percent: 0.1, base: 0 },
    { min: 1646, percent: 0.12, base: 96.7 },
    { min: 4608, percent: 0.22, base: 452.14 },
    { min: 9056, percent: 0.24, base: 1430.7 },
  ],
};
const numPeriods = 24; // 1b
const allowance = 179;
const fwh = (empRates, taxableIncome) => {
  let adjustedWage;
  let table;
  const allowances = empRates.FWH;
  const gross1c = taxableIncome; // 1a - if annual, * numPeriods;
  const {
    dependentDeductions = 0, // W4-3
    otherIncome = 0, // W-4 4a - 1c
    deductions = 0, // W-4 4b - 1f
    extraWithholding = 0, // W-4 4c
    multipleJobs = 0, // h
  } = empRates;

  // Step 1 - Adjusted Wage
  if (allowances.length === 2) { // 2019 or earlier W-4
    table = allowances.substring(0, 1).toLowerCase();
    table += '2';
    const allow = allowances.substring(1);
    // const deduct1k = allow * allowance;
    adjustedWage = gross1c - (allow * allowance);
  } else { // 2020 W-4
    table = allowances.substring(0, 1).toLowerCase();
    adjustedWage = gross1c + (otherIncome / numPeriods); // 1d
    adjustedWage -= (deductions / numPeriods); // 1h
    if (multipleJobs) {
      table += 'h';
    // } else {
    //  adjustedAnWage -= (table === 'm' ? 12900 : 8600);
    }
  }
  if (adjustedWage < 0) {
    adjustedWage = 0;
  }

  // Step 2
  const { bracket } = semimonthlyTable[table].reduce((result, row) => {
    if (row.min <= adjustedWage) {
      // eslint-disable-next-line
      result.bracket = row;
    }
    return result;
  }, {});
  // at this point, bracket should contain our tax bracket
  let amount = ((adjustedWage - bracket.min) * bracket.percent) + bracket.base; // 2f
  // amount /= numPeriods;

  // Step 3
  if (dependentDeductions) {
    amount -= (dependentDeductions / numPeriods); // 3c
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
