export const RENTAL_AGREEMENT_SAMPLE = `
RESIDENTIAL LEASE AGREEMENT

This Lease Agreement ("Lease") is entered into as of January 1, 2024, between Harbor Properties LLC ("Landlord") and the undersigned tenant(s) ("Tenant").

PROPERTY: 742 Evergreen Terrace, Unit 3B

LEASE TERM: January 1, 2024 to December 31, 2024 (12 months)

MONTHLY RENT: $2,800 per month, due on the 1st of each month.

SECTION 1 — SECURITY DEPOSIT
Tenant shall deposit $8,400 (3 months rent) as a security deposit. The security deposit shall be returned within 21 days of move-out, less deductions for: any damage beyond normal wear and tear (as determined solely by Landlord), professional cleaning fees ($350 minimum regardless of condition), carpet replacement ($1,200 flat fee if any carpet shows use), painting fees ($600 per room if any walls have marks), administrative processing fee ($150), and re-letting fee if Tenant does not provide 90 days notice. Landlord's determination of damages is final and not subject to challenge except through arbitration.

SECTION 2 — LATE FEES
Rent received after the 3rd of the month shall incur a late fee of 5% of monthly rent. Each additional day of non-payment shall incur an additional 5% compounding late fee on the outstanding balance. Late fees compound daily until paid.

SECTION 3 — LANDLORD ENTRY
Landlord reserves the right to enter the premises upon 12 hours notice for inspections, repairs, or to show the unit to prospective tenants. In case of emergency, Landlord may enter at any time without notice.

SECTION 4 — MAINTENANCE AND REPAIRS
Tenant shall be responsible for all repairs and maintenance costing less than $500. Tenant shall promptly report any needed repairs to Landlord. Failure to report maintenance issues that result in further damage will make Tenant liable for all resulting damages, regardless of cost.

SECTION 5 — TENANT LIABILITY FOR VISITORS
Tenant shall be liable for any damage caused by, or any injury sustained by, any visitor or guest on the premises, regardless of whether the damage or injury was caused by Tenant's actions. Tenant assumes full liability for any personal injury occurring on the premises, including injuries caused by pre-existing conditions or defects.

SECTION 6 — LEASE RENEWAL
This Lease shall automatically renew for successive one-year terms at Landlord's discretion, with rent increases not to exceed 20% per renewal period. Landlord shall provide notice of renewal and any rent increase at least 30 days before the lease end date. Tenant must provide 90 days written notice to terminate at the end of any lease term.

SECTION 7 — PETS
No pets are permitted without express written consent and an additional non-refundable pet deposit of $1,500 per pet, plus $200/month additional pet rent per pet. Violation results in immediate lease termination.

SECTION 8 — SUBLETTING
Subletting is strictly prohibited. Allowing any unauthorized occupant to reside at the property for more than 7 consecutive days constitutes a lease violation.

SECTION 9 — ALTERATIONS
Tenant may not make any alterations to the premises without Landlord's written consent. Any alterations made, whether consented to or not, become the property of Landlord upon termination. Tenant must restore the property to its original condition at Tenant's expense if Landlord so requests.

SECTION 10 — UTILITIES
Tenant is responsible for all utilities, including electricity, gas, water, trash, internet, and cable. Tenant is also responsible for snow removal, lawn care, and pest control within 10 feet of the unit entrance.

SECTION 11 — NOTICES
All notices must be delivered by certified mail to Landlord's registered address. Email notices are not valid for any purposes under this Agreement.

SECTION 12 — DEFAULT
If Tenant fails to pay rent or breaches any provision of this Lease, Landlord may terminate this Lease with 3 days written notice. Tenant shall be liable for all remaining rent due for the full lease term, plus any costs of re-letting the unit, including Landlord's attorney fees.

SECTION 13 — ARBITRATION
Any disputes arising from this Lease shall be resolved by binding arbitration, waiving Tenant's right to a jury trial or class action. Arbitration shall take place at a location chosen by Landlord at Tenant's expense.

SECTION 14 — WAIVER OF HABITABILITY CLAIMS
Tenant agrees that the premises are accepted in "as-is" condition and waives any claims related to habitability except for conditions that pose an immediate threat to life.

SECTION 15 — SMOKING AND CANNABIS
Smoking of any substance, including tobacco and cannabis, is prohibited inside the unit or within 25 feet of the building. Violation is grounds for immediate eviction and Tenant shall be liable for all remediation costs.

SECTION 16 — GOVERNING LAW
This Agreement shall be governed by the laws of the state where the property is located.

TENANT SIGNATURE: ___________________ DATE: ___________
LANDLORD SIGNATURE: ___________________ DATE: ___________
`;

export const RENTAL_AGREEMENT_META = {
  title: "Rental Agreement",
  description: "Residential lease with compounding late fees, unreturnable deposit, and broad tenant liability",
  type: "rental",
  riskPreview: "HIGH — Daily 5% compounding late fees likely illegal, deposit conditions effectively unreturnable",
};
