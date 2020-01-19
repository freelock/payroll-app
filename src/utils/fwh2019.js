/**
 * FWH calculator
 * Based on work by https://gist.github.com/Liath/f4c65891ad90f71ddf30
 *
 * Modernized and set with 2019 semi-monthly brackets
 *
 * TABLE 3—SEMIMONTHLY Payroll Period
 */
const semimonthly = {
  s: [ // single
    { min: 0, percent: 0, base: 0 },
    { min: 158, percent: 0.1, base: 0 },
    { min: 563, percent: 0.12, base: 40.50 },
    { min: 1803, percent: 0.22, base: 189.30 },
    { min: 3667, percent: 0.24, base: 599.38 },
    { min: 6855, percent: 0.32, base: 1364.50 },
    { min: 8663, percent: 0.35, base: 1943.06 },
    { min: 21421, percent: 0.37, base: 6408.36 },
  ],
  m: [ // married
    { min: 0, percent: 0, base: 0 },
    { min: 492, percent: 0.1, base: 0 },
    { min: 1300, percent: 0.12, base: 80.80 },
    { min: 3781, percent: 0.22, base: 378.52 },
    { min: 7508, percent: 0.24, base: 1198.46 },
    { min: 13885, percent: 0.32, base: 2728.94 },
    { min: 17500, percent: 0.35, base: 3885.74 },
    { min: 26006, percent: 0.37, base: 6862.84 },
  ],
};
const allowance = 175;
const fwh = (empRates, taxableIncome) => {
  const allowances = empRates.FWH;
  const table = allowances.substring(0, 1).toLowerCase();
  const allow = allowances.substring(1);
  let taxable = taxableIncome - (allow * allowance);
  if (taxable < 0) {
    taxable = 0;
  }
  const { bracket } = semimonthly[table].reduce((result, row) => {
    if (row.min <= taxable) {
      // eslint-disable-next-line
      result.bracket = row;
    }
    return result;
  }, {});
  // at this point, bracket should contain our tax bracket
  return ((taxable - bracket.min) * bracket.percent) + bracket.base;
};

export default fwh;
