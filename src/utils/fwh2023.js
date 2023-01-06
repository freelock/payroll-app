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
const annualTable = {
  s: [ // single or married filing separately
    { min: 0, percent: 0, base: 0 },
    { min: 5250, percent: 0.1, base: 0 },
    { min: 16250, percent: 0.12, base: 1100.00 },
    { min: 49975, percent: 0.22, base: 5147.00 },
    { min: 100625, percent: 0.24, base: 16290.00 },
    { min: 187350, percent: 0.32, base: 37104.00 },
    { min: 236500, percent: 0.35, base: 52832.00 },
    { min: 583375, percent: 0.37, base: 174238.25 },
  ],
  m: [ // married
    { min: 0, percent: 0, base: 0 },
    { min: 14800, percent: 0.1, base: 0 },
    { min: 36800, percent: 0.12, base: 2200 },
    { min: 104250, percent: 0.22, base: 10294 },
    { min: 205550, percent: 0.24, base: 32580 },
    { min: 379000, percent: 0.32, base: 74208 },
    { min: 477300, percent: 0.35, base: 105664 },
    { min: 708550, percent: 0.37, base: 186601.50 },
  ],
  h: [ // head of household
    { min: 0, percent: 0, base: 0 },
    { min: 12200, percent: 0.1, base: 0 },
    { min: 27900, percent: 0.12, base: 1570 },
    { min: 72050, percent: 0.22, base: 6868 },
    { min: 107550, percent: 0.24, base: 14678 },
    { min: 194300, percent: 0.32, base: 35498 },
    { min: 243450, percent: 0.35, base: 51226 },
    { min: 590300, percent: 0.37, base: 172623.5 },
  ],
  sh: [ // single or married filing separately - multiple jobs
    { min: 0, percent: 0, base: 0 },
    { min: 6925, percent: 0.1, base: 0 },
    { min: 12425, percent: 0.12, base: 550 },
    { min: 29288, percent: 0.22, base: 2573.50 },
    { min: 54613, percent: 0.24, base: 8145.00 },
    { min: 97975, percent: 0.32, base: 18552.00 },
    { min: 122550, percent: 0.35, base: 26416.00 },
    { min: 295988, percent: 0.37, base: 87119.13 },
  ],
  mh: [ // married - multiple jobs
    { min: 0, percent: 0, base: 0 },
    { min: 13850, percent: 0.1, base: 0 },
    { min: 24850, percent: 0.12, base: 1100.00 },
    { min: 58575, percent: 0.22, base: 5147.00 },
    { min: 109225, percent: 0.24, base: 16290.00 },
    { min: 195950, percent: 0.32, base: 37104.00 },
    { min: 245100, percent: 0.35, base: 52832.00 },
    { min: 360725, percent: 0.37, base: 93300.75 },
  ],
  hh: [ // head of household - multiple jobs
    { min: 0, percent: 0, base: 0 },
    { min: 10400, percent: 0.1, base: 0 },
    { min: 18250, percent: 0.12, base: 785 },
    { min: 40325, percent: 0.22, base: 3434 },
    { min: 58075, percent: 0.24, base: 7339 },
    { min: 101450, percent: 0.32, base: 17749 },
    { min: 126025, percent: 0.35, base: 25613 },
    { min: 299450, percent: 0.37, base: 86311.75 },
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
