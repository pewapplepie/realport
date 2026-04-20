import type { PropertyRecord } from "@/lib/types";

export const MANSION_TAX_THRESHOLD = 1_000_000;

export function monthlyPayment(
  principal: number,
  annualRate: number,
  years: number
) {
  if (principal <= 0 || years <= 0) return 0;

  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) {
    return principal / months;
  }

  const growth = Math.pow(1 + monthlyRate, months);
  return principal * ((monthlyRate * growth) / (growth - 1));
}

export function calculateTargetDealMetrics(
  property: Pick<
    PropertyRecord,
    | "purchasePrice"
    | "downPaymentPercent"
    | "includeClosingFeeInEquityLoan"
    | "closingFeePercent"
    | "includeMansionTaxInEquityLoan"
    | "mansionTaxPercent"
    | "mortgageRate"
    | "mortgageYears"
    | "monthlyHoa"
    | "monthlyTax"
    | "equityLoanRate"
    | "equityLoanYears"
  >
) {
  const downPayment = property.purchasePrice * (property.downPaymentPercent / 100);
  const closingFee = property.includeClosingFeeInEquityLoan
    ? property.purchasePrice * (property.closingFeePercent / 100)
    : 0;
  const mansionTaxEligible = property.purchasePrice > MANSION_TAX_THRESHOLD;
  const mansionTax =
    property.includeMansionTaxInEquityLoan && mansionTaxEligible
      ? property.purchasePrice * (property.mansionTaxPercent / 100)
      : 0;

  const equityLoanPrincipal = downPayment + closingFee + mansionTax;
  const mortgagePrincipal = Math.max(property.purchasePrice - downPayment, 0);
  const equityLoanPayment = monthlyPayment(
    equityLoanPrincipal,
    property.equityLoanRate,
    property.equityLoanYears
  );
  const mortgagePayment = monthlyPayment(
    mortgagePrincipal,
    property.mortgageRate,
    property.mortgageYears
  );
  const carryingCost =
    equityLoanPayment + mortgagePayment + property.monthlyHoa + property.monthlyTax;

  return {
    downPayment,
    closingFee,
    mansionTax,
    mansionTaxEligible,
    equityLoanPrincipal,
    mortgagePrincipal,
    equityLoanPayment,
    mortgagePayment,
    carryingCost,
  };
}
