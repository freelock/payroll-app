/**
 * FWH calculator
 * Based on work by https://gist.github.com/Liath/f4c65891ad90f71ddf30
 *
 * Modernized and set with 2018 semi-monthly brackets
 */
const semimonthly = {
  s: [ // single
    { min: 0, percent: 0, base: 0 },
    { min: 96, percent: 0.1, base: 0 },
    { min: 484, percent: 0.15, base: 38.80 },
    { min: 1677, percent: 0.25, base: 217.75 },
    { min: 3925, percent: 0.28, base: 779.75 },
    { min: 8081, percent: 0.33, base: 1943.43 },
    { min: 17458, percent: 0.35, base: 5037.84 },
    { min: 17529, percent: 0.396, base: 5062.69 },
  ],
  m: [ // married
    { min: 0, percent: 0, base: 0 },
    { min: 360, percent: 0.1, base: 0 },
    { min: 1138, percent: 0.15, base: 77.80 },
    { min: 3523, percent: 0.25, base: 435.55 },
    { min: 6740, percent: 0.28, base: 1239.80 },
    { min: 10083, percent: 0.33, base: 2175.84 },
    { min: 17723, percent: 0.35, base: 4697.04 },
    { min: 19973, percent: 0.396, base: 5484.54 },
  ],
};
const allowance = 168.8;
const fwh = (allowances, taxableIncome) => {
  const table = allowances.substring(0, 1).toLowerCase();
  const allow = allowances.substring(1);
  const taxable = taxableIncome - (allow * allowance);
  console.log('using 2017fwh tables;');
  const { bracket } = semimonthly[table].reduce((result, row) => {
    if (row.min < taxable) {
      // eslint-disable-next-line
      result.bracket = row;
    }
    return result;
  }, {});
  // at this point, bracket should contain our tax bracket
  return ((taxable - bracket.min) * bracket.percent) + bracket.base;
};

export default fwh;
