/**
 * FWH calculator
 * Based on work by https://gist.github.com/Liath/f4c65891ad90f71ddf30
 *
 * Modernized and set with 2019 semi-monthly brackets
 * 
 * TABLE 3—SEMIMONTHLY Payroll Period
 *(a) SINGLE person (including head of household)—	(b) MARRIED person—
If the amount of wages
(after subtracting
withholding allowances) is:	The amount of income tax
to withhold is:	If the amount of wages
(after subtracting
withholding allowances) is:	The amount of income tax
to withhold is:
Not over $158	$0	 	Not over $492	$0	 
Over—	But not over—	of excess over—	Over—	But not over—	of excess over—
$158	—$563	 	$0.00 plus 10%	—$158	$492	—$1,300	 	$0.00 plus 10%	—$492
$563	—$1,803	 	$40.50 plus 12%	—$563	$1,300	—$3,781	 	$80.80 plus 12%	—$1,300
$1,803	—$3,667	 	$189.30 plus 22%	—$1,803	$3,781	—$7,508	 	$378.52 plus 22%	—$3,781
$3,667	—$6,855	 	$599.38 plus 24%	—$3,667	$7,508	—$13,885	 	$1,198.46 plus 24%	—$7,508
$6,855	—$8,663	 	$1,364.50 plus 32%	—$6,855	$13,885	—$17,500	 	$2,728.94 plus 32%	—$13,885
$8,663	—$21,421	 	$1,943.06 plus 35%	—$8,663	$17,500	—$26,006	 	$3,885.74 plus 35%	—$17,500
$21,421	 	$6,408.36 plus 37%	—$21,421	$26,006	 	$6,862.84 plus 37%	—$26,006
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
const fwh = (allowances, taxableIncome) => {
  const table = allowances.substring(0, 1).toLowerCase();
  const allow = allowances.substring(1);
  const taxable = taxableIncome - (allow * allowance);

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
