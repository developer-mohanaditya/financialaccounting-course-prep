/**
 * Chart of accounts reproduced from the Exam Training handout annexes
 * (balance sheet accounts and profit-and-loss accounts).
 */

export interface ChartEntry {
  number: string;
  wording: string;
}

export interface ChartGroup {
  heading: string;
  entries: ChartEntry[];
}

export const BALANCE_SHEET_CHART: ChartGroup[] = [
  {
    heading: 'Equity',
    entries: [
      { number: '10', wording: 'Capital' },
      { number: '11', wording: 'Retained earnings' },
      { number: '12', wording: 'Profit/Loss for the year' },
      { number: '15', wording: 'Provisions for risks and charges' },
      { number: '16', wording: 'Borrowings' },
    ],
  },
  {
    heading: 'Fixed asset accounts',
    entries: [
      { number: '20', wording: 'Intangible assets' },
      { number: '21', wording: 'Tangible assets: property' },
      { number: '22', wording: 'Tangible assets: buildings' },
      { number: '23', wording: 'Tangible assets: factory equipment' },
      { number: '24', wording: 'Tangible assets: transport' },
      { number: '25', wording: 'Tangible assets: office equipment' },
      { number: '26', wording: 'Equity investments (shares)' },
      { number: '28', wording: 'Amortization of intangible assets' },
      { number: '28', wording: 'Depreciation of tangible assets' },
      { number: '29', wording: 'Impairment of intangible assets' },
      { number: '29', wording: 'Impairment of tangible assets' },
      { number: '29', wording: 'Impairment of equity investments' },
    ],
  },
  {
    heading: 'Inventories and work in progress',
    entries: [
      { number: '31', wording: 'Raw materials inventory' },
      { number: '35', wording: 'Finished goods inventory' },
      { number: '37', wording: 'Merchandise inventory' },
    ],
  },
  {
    heading: 'Third-party accounts',
    entries: [
      { number: '40', wording: 'Suppliers of goods & services' },
      { number: '40', wording: 'Suppliers of fixed assets' },
      { number: '40', wording: 'Suppliers – Invoices not yet received' },
      { number: '41', wording: 'Customers' },
      { number: '41', wording: 'Doubtful customers' },
      { number: '41', wording: 'Customers – Invoices to be issued' },
      { number: '42', wording: 'Personnel – Remuneration payable' },
      { number: '43', wording: 'Social security bodies' },
      { number: '44', wording: 'State – Corporate income tax' },
      { number: '44', wording: 'Deductible VAT' },
      { number: '44', wording: 'Collected VAT' },
      { number: '44', wording: 'VAT to be adjusted' },
      { number: '44', wording: 'VAT payable' },
      { number: '44', wording: 'Other taxes and similar levies' },
      { number: '45', wording: 'Shareholders – Dividends payable' },
      { number: '48', wording: 'Prepaid expenses' },
      { number: '48', wording: 'Deferred income' },
      { number: '49', wording: 'Impairment of customer accounts' },
    ],
  },
  {
    heading: 'Financial accounts',
    entries: [
      { number: '51', wording: 'Bank' },
      { number: '53', wording: 'Cash' },
    ],
  },
];

export const PROFIT_AND_LOSS_CHART: ChartGroup[] = [
  {
    heading: 'Expense accounts',
    entries: [
      { number: '60', wording: 'Purchases of merchandise' },
      { number: '60', wording: 'Purchases of raw materials' },
      { number: '60', wording: 'Purchases of office supplies' },
      { number: '60', wording: 'Change in merchandise inventory' },
      { number: '60', wording: 'Change in raw material inventory' },
      { number: '61', wording: 'Rentals/Leases' },
      { number: '62', wording: 'Postal and telecommunication charges' },
      { number: '62', wording: 'Professional fees' },
      { number: '62', wording: 'Temporary staff' },
      { number: '63', wording: 'Taxes and similar levies' },
      { number: '64', wording: 'Staff remuneration' },
      { number: '64', wording: 'Employer social security contributions' },
      { number: '65', wording: 'Losses on bad debts' },
      { number: '66', wording: 'Financial expenses' },
      { number: '665', wording: 'Cash discounts granted' },
      { number: '67', wording: 'Exceptional expenses' },
      { number: '68', wording: 'Depreciation charges' },
      { number: '68', wording: 'Impairment charges on tangible and intangible fixed assets' },
      { number: '68', wording: 'Impairment charges on current assets (inventory or receivables)' },
      { number: '68', wording: 'Impairment charges on financial assets' },
      { number: '68', wording: 'Provisions for financial risks and charges' },
      { number: '69', wording: 'Corporate income tax' },
    ],
  },
  {
    heading: 'Income accounts',
    entries: [
      { number: '70', wording: 'Sales' },
      { number: '71', wording: 'Stocked production (change in finished goods inventory)' },
      { number: '76', wording: 'Financial income' },
      { number: '765', wording: 'Cash discounts received' },
      { number: '78', wording: 'Reversals of operating provisions' },
      { number: '77', wording: 'Exceptional income' },
      { number: '78', wording: 'Reversals of impairment on financial assets' },
      { number: '78', wording: 'Reversals of impairment on current assets (inventory or receivables)' },
      { number: '78', wording: 'Reversals of operating provisions' },
      { number: '78', wording: 'Reversal of provision for risks and charges' },
    ],
  },
];
