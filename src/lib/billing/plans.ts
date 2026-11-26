export const PRO_MONTHLY_PRICE = {
  amount: "5.99",
  currency: "USD",
  interval: "month" as const,
  label: "$5.99 US/month",
};

export const PRO_ANNUAL_PRICE = {
  amount: "49.99",
  currency: "USD",
  interval: "year" as const,
  label: "$49.99 US/year",
};

export const FREE_EVALUATION_LIMIT_FALLBACK = 3;

export const TRIAL_LENGTH_DAYS = 30;

export function annualSavingsPercent() {
  const monthlyYear = Number(PRO_MONTHLY_PRICE.amount) * 12;
  const annual = Number(PRO_ANNUAL_PRICE.amount);
  return Math.round((1 - annual / monthlyYear) * 100);
}
