/**
 * FWH calculator
 * Based on work by https://gist.github.com/Liath/f4c65891ad90f71ddf30
 *
 * Modernized and set with 2018 semi-monthly brackets
 */
const semimonthly = {
  s: [ // single
    { min: 0, percent: 0, base: 0 },
    { min: 154, percent: 0.1, base: 0 },
    { min: 551, percent: 0.12, base: 39.70 },
    { min: 1767, percent: 0.22, base: 185.62 },
    { min: 3592, percent: 0.24, base: 587.12 },
    { min: 6717, percent: 0.32, base: 1337.12 },
    { min: 8488, percent: 0.35, base: 1903.84 },
    { min: 20988, percent: 0.37, base: 6278.84 },
  ],
  m: [ // married
    { min: 0, percent: 0, base: 0 },
    { min: 481, percent: 0.1, base: 0 },
    { min: 1275, percent: 0.12, base: 79.40 },
    { min: 3704, percent: 0.22, base: 371.12 },
    { min: 7356, percent: 0.24, base: 1174.12 },
    { min: 13606, percent: 0.32, base: 2674.12 },
    { min: 17148, percent: 0.35, base: 3807.56 },
    { min: 25481, percent: 0.37, base: 6724.11 },
  ],
};
const allowance = 172.9;
const fwh = (allowances, taxableIncome) => {
  const table = allowances.substring(0, 1).toLowerCase();
  const allow = allowances.substring(1);
  let taxable = taxableIncome - (allow * allowance);
  if (taxable < 0) {
    taxable = 0;
  }

  console.log('using 2018fwh tables;');
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
