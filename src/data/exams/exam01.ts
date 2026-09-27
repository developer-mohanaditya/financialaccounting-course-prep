import type { EntryLine } from '../../lib/types';
import { buildExam, type ExamBlueprint } from '../examKit';

const line = (
  date: string,
  category: EntryLine['category'],
  number: string,
  wording: string,
  amount: number,
  side: 'debit' | 'credit',
  note: string,
): EntryLine => ({
  date,
  category,
  number,
  wording,
  debit: side === 'debit' ? amount : null,
  credit: side === 'credit' ? amount : null,
  note,
});

const blueprint: ExamBlueprint = {
  id: 'exam-01',
  number: 1,
  company: 'Novara Conseil',
  caseHeading: 'Novara case',
  summary: 'Digital consulting SARL closing its second full financial year.',
  topics: [
    'Accruals and prepaid expenses',
    'Fixed asset acquisition and depreciation',
    'VAT',
    'Payroll',
    'Cash discounts',
    'Corporate income tax',
    'Profit distribution',
  ],
  introParagraphs: [
    'Novara Conseil is a limited liability company (SARL) founded in March 2019. It provides digital communication consulting to regional retailers. Its closing date is December 31. Apply a VAT rate of 20% where necessary and an income tax rate of 25%.',
    'It is now February 2027; you are an intern at the company and the manager has asked you to record the entries for the financial year ended December 31, 2026 that had not yet been booked.',
  ],
  mcqIds: ['a01', 'c01', 'a16', 'a32', 'c25', 'c16', 'b09', 'a25', 'd04', 'c21'],
  items: [
    {
      kind: 'entry',
      id: 'e01-1',
      points: 2,
      topic: 'Prepaid expenses',
      prompt:
        '1) Invoice dated 14/09/2026 for the annual maintenance contract on the studio equipment, covering the period from 1 October 2026 to 30 September 2027: €7,200 incl. tax (payment via direct debit on 30/09/2026). Record the accounting entries for the invoice, the payment, and the adjustment. (2 pts)',
      lines: [
        line('2026-09-14', 'EXPENSE', '61', 'Maintenance and repairs', 6000, 'debit', 'Cost excluding tax: 7,200 / 1.20 = 6,000, which is the amount of the service consumed over the contract period.'),
        line('2026-09-14', 'ASSET', '44', 'Deductible VAT', 1200, 'debit', 'VAT of 20% on the service: 6,000 × 20% = 1,200, recoverable on the next VAT return.'),
        line('2026-09-14', 'LIABILITY', '40', 'Suppliers of goods & services', 7200, 'credit', 'The debt to the supplier is recorded including tax.'),
        line('2026-09-30', 'LIABILITY', '40', 'Suppliers of goods & services', 7200, 'debit', 'The direct debit clears the supplier account.'),
        line('2026-09-30', 'ASSET', '51', 'Bank', 7200, 'credit', 'The bank account is credited with the amount of the direct debit.'),
        line('2026-12-31', 'ASSET', '48', 'Prepaid expenses', 4500, 'debit', 'Three months (October to December) relate to 2026, so nine months are carried forward: 6,000 × 9/12 = 4,500.'),
        line('2026-12-31', 'EXPENSE', '61', 'Maintenance and repairs', 4500, 'credit', 'The maintenance expense of 2026 is reduced to the four quarters consumed in the year, increasing the profit of 2026.'),
      ],
      explanation: [
        'Cost excluding tax: €7,200 / 1.20 = €6,000; deductible VAT: €6,000 × 20% = €1,200.',
        'The invoice creates the expense and the debt to the supplier; the direct debit clears that debt against the bank.',
        'Period covered: 1 October 2026 to 30 September 2027. Only October, November and December 2026 belong to the current year, i.e. 3/12 of the premium.',
        'Prepaid expenses at 31/12/2026: €6,000 × 9/12 = €4,500, which will be reversed on 1 January 2027 and expensed during 2027.',
        'Net effect on 2026 profit: −€1,500 (three months of maintenance), and the prepaid expense of €4,500 appears in current assets.',
      ],
    },
    {
      kind: 'entry',
      id: 'e01-2',
      points: 2,
      topic: 'Fixed asset acquisition and depreciation',
      prompt:
        '2) Invoice dated 03/11/2026 for the acquisition of a delivery van: €36,000 incl. tax, settled the same day by bank transfer. The van is put into service on 1 December 2026 and depreciated on a straight-line basis over 5 years. Record the entries for the acquisition, the payment, and the depreciation. (2 pts)',
      lines: [
        line('2026-11-03', 'ASSET', '24', 'Tangible assets: transport', 30000, 'debit', 'Acquisition cost excluding tax: 36,000 / 1.20 = 30,000. A van is a non-current asset intended to be used for five years.'),
        line('2026-11-03', 'ASSET', '44', 'Deductible VAT', 6000, 'debit', 'VAT of 20%: 30,000 × 20% = 6,000, deductible in full.'),
        line('2026-11-03', 'ASSET', '51', 'Bank', 36000, 'credit', 'The transfer of 03/11/2026 settles the invoice immediately: no supplier account is created.'),
        line('2026-12-31', 'EXPENSE', '68', 'Depreciation charges', 500, 'debit', 'Depreciation of the year: 30,000 × (100% / 5) × 1/12 = 500. Depreciation starts on the commissioning date, 1 December 2026.'),
        line('2026-12-31', 'ASSET', '28', 'Depreciation of tangible assets', 500, 'credit', 'Accumulated depreciation increases; the gross amount of the van stays at 30,000 and its net book value is 29,500.'),
      ],
      explanation: [
        'Acquisition cost = €36,000 / 1.20 = €30,000 excluding tax, with €6,000 of deductible VAT. There are no directly attributable costs to add.',
        'Payment and acquisition are recorded in a single entry because the invoice is settled on the same day.',
        'Straight-line rate = 100% / 5 years = 20% per year, i.e. €6,000 for a full year.',
        'Commissioning date is 1 December 2026, so only one month is depreciated in 2026: €6,000 × 1/12 = €500.',
        'From 2027 the annual depreciation will be €6,000, until the van is fully depreciated.',
      ],
    },
    {
      kind: 'entry',
      id: 'e01-3',
      points: 1,
      topic: 'Bank and cash',
      prompt:
        '3) On 12/05/2026, cash withdrawal from the bank account: €1,200, used to replenish the petty cash box held at reception. (1 pt)',
      lines: [
        line('2026-05-12', 'ASSET', '53', 'Cash', 1200, 'debit', 'The cash on hand increases; the withdrawal is not an expense but a transfer between two asset accounts.'),
        line('2026-05-12', 'ASSET', '51', 'Bank', 1200, 'credit', 'The bank account decreases by the amount withdrawn.'),
      ],
      explanation: [
        'A cash withdrawal does not affect profit: it simply moves €1,200 from the bank account to the cash box.',
        'Both accounts are asset accounts, which is why the entry reads debit Cash / credit Bank.',
      ],
    },
    {
      kind: 'entry',
      id: 'e01-4',
      points: 2,
      topic: 'Payroll',
      prompt:
        '4) Accounting entry on 30/11/2026 for November salaries and social security contributions. Payment of the net salaries by bank transfer is also made on 30/11/2026.\n- Gross salary: €84,000, including €18,480 in employee deductions\n- Social security contributions (employer share): €33,600 (2 pts)',
      context: {
        caption: 'November 2026 payroll summary',
        columns: ['Item', 'Amount (€)'],
        rows: [
          ['Gross salaries', 84000],
          ['Employee social security contributions (22%)', 18480],
          ['Employer social security contributions (40%)', 33600],
          ['Net salaries payable', 65520],
        ],
        emphasisRows: [3],
        align: ['left', 'right'],
      },
      lines: [
        line('2026-11-30', 'EXPENSE', '64', 'Staff remuneration', 84000, 'debit', 'Gross salaries are the full personnel cost borne through employees’ pay, part of which is withheld.'),
        line('2026-11-30', 'EXPENSE', '64', 'Employer social security contributions', 33600, 'debit', 'The employer share is an additional company cost of 40% of gross salaries.'),
        line('2026-11-30', 'LIABILITY', '42', 'Personnel – Remuneration payable', 65520, 'credit', 'Net salaries owed to employees: 84,000 − 18,480 = 65,520.'),
        line('2026-11-30', 'LIABILITY', '43', 'Social security bodies', 52080, 'credit', 'Amount owed to the social bodies: employee share 18,480 + employer share 33,600 = 52,080.'),
        line('2026-11-30', 'LIABILITY', '42', 'Personnel – Remuneration payable', 65520, 'debit', 'The bank transfer clears the debt to the employees.'),
        line('2026-11-30', 'ASSET', '51', 'Bank', 65520, 'credit', 'The net salaries leave the bank account; the contributions are paid at a later date.'),
      ],
      explanation: [
        'Net salaries = gross salaries − employee contributions = €84,000 − €18,480 = €65,520.',
        'Total personnel expense for the month = gross salaries + employer contributions = €84,000 + €33,600 = €117,600, split between accounts 64 Staff remuneration and 64 Employer social security contributions.',
        'The company pays both shares to the social bodies, hence the single liability of €52,080 in account 43.',
        'Only the net salaries leave the bank on 30/11/2026; the social contributions remain payable until they are paid.',
      ],
    },
    {
      kind: 'entry',
      id: 'e01-5',
      points: 2,
      topic: 'Sales and VAT',
      prompt:
        '5) Revenue generated in October 2026: €54,000 excluding tax.\n- of which €18,000 was received by bank transfer\n- of which €21,600 was paid by bank card, credited to the bank account\n- and the balance remains to be collected from customers. (2 pts)',
      lines: [
        line('2026-10-31', 'ASSET', '51', 'Bank', 39600, 'debit', 'Amounts already collected including tax: 18,000 + 21,600 = 39,600.'),
        line('2026-10-31', 'ASSET', '41', 'Customers', 25200, 'debit', 'Amount still to be collected including tax: 64,800 − 39,600 = 25,200, i.e. €21,000 excluding tax.'),
        line('2026-10-31', 'REVENUE', '70', 'Sales', 54000, 'credit', 'Revenue is recognised excluding tax, at the time the services are performed.'),
        line('2026-10-31', 'LIABILITY', '44', 'Collected VAT', 10800, 'credit', 'VAT collected on the sales: 54,000 × 20% = 10,800, a debt to the State, not revenue.'),
      ],
      explanation: [
        'Revenue excluding tax = €54,000; VAT = €54,000 × 20% = €10,800; total invoiced including tax = €64,800.',
        'Cash collected = €18,000 + €21,600 = €39,600. The remaining balance is €64,800 − €39,600 = €25,200 including tax, i.e. €21,000 excluding tax.',
        'Check on the entry: debits €39,600 + €25,200 = €64,800 = credits €54,000 + €10,800. ✔',
        'VAT collected is a liability; it appears neither in the income statement nor in equity.',
      ],
    },
    {
      kind: 'entry',
      id: 'e01-6',
      points: 1,
      topic: 'Purchases and VAT',
      prompt:
        '6) Invoice dated 22/10/2026 for the purchase of office supplies (paper, printer cartridges). Immediate payment by bank transfer of €1,440 incl. tax; a balance of €960 incl. tax remains to be paid to the supplier at a later date. (1 pt)',
      lines: [
        line('2026-10-22', 'EXPENSE', '60', 'Purchases of office supplies', 2000, 'debit', 'Total excluding tax: 2,400 / 1.20 = 2,000, being 1,200 paid immediately plus 800 on account.'),
        line('2026-10-22', 'ASSET', '44', 'Deductible VAT', 400, 'debit', 'VAT of 20% on the whole invoice: 2,000 × 20% = 400.'),
        line('2026-10-22', 'ASSET', '51', 'Bank', 1440, 'credit', 'Amount settled immediately, including tax.'),
        line('2026-10-22', 'LIABILITY', '40', 'Suppliers of goods & services', 960, 'credit', 'Balance still owed to the supplier, including tax.'),
      ],
      explanation: [
        'Total invoice including tax = €1,440 + €960 = €2,400, so excluding tax €2,400 / 1.20 = €2,000 and VAT €400.',
        'Office supplies are consumed immediately, so the whole amount is an expense of 2026; there is nothing to carry forward.',
        'Check: debits €2,000 + €400 = €2,400 = credits €1,440 + €960. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e01-7',
      points: 2,
      topic: 'Cash discounts',
      prompt:
        '7) A professional fees invoice for €9,000 excluding tax is received on 25/11/2026. The payment terms offer a 2% discount for immediate payment. The company takes advantage of the discount and settles the amount by bank transfer on 28/11/2026. Record the accounting entries for the invoice and the payment. (2 pts)',
      lines: [
        line('2026-11-25', 'EXPENSE', '62', 'Professional fees', 9000, 'debit', 'The service is recorded at its full amount excluding tax when the invoice is received.'),
        line('2026-11-25', 'ASSET', '44', 'Deductible VAT', 1800, 'debit', 'VAT of 20% on €9,000 = €1,800.'),
        line('2026-11-25', 'LIABILITY', '40', 'Suppliers of goods & services', 10800, 'credit', 'The full debt including tax is recorded first: 9,000 + 1,800 = 10,800.'),
        line('2026-11-28', 'LIABILITY', '40', 'Suppliers of goods & services', 10800, 'debit', 'The supplier account is cleared for the full invoiced amount.'),
        line('2026-11-28', 'REVENUE', '765', 'Cash discounts received', 216, 'credit', 'Discount of 2% on the amount including tax: 10,800 × 2% = 216, recognised as financial income.'),
        line('2026-11-28', 'ASSET', '51', 'Bank', 10584, 'credit', 'Amount actually paid: 10,800 − 216 = 10,584.'),
      ],
      explanation: [
        'Invoice incl. tax = €9,000 + €1,800 = €10,800.',
        'Discount = €10,800 × 2% = €216 including tax.',
        'Amount settled = €10,800 − €216 = €10,584.',
        'The cash discount is not netted against professional fees: it is recognised separately as financial income (account 765). Check: debits €10,800 + €10,800 = €21,600 = credits €10,800 + €216 + €10,584. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e01-8',
      points: 1,
      topic: 'Accrued expenses',
      prompt:
        '8) The company estimates its December 2026 electricity costs at approximately €2,400 excluding tax. The energy supplier’s bill will be issued in January 2027. Record the adjusting entry, if necessary. (1 pt)',
      lines: [
        line('2026-12-31', 'EXPENSE', '60', 'Energy purchases', 2400, 'debit', 'The consumption took place in December 2026, so the expense belongs to 2026.'),
        line('2026-12-31', 'LIABILITY', '40', 'Suppliers – Invoices not yet received', 2400, 'credit', 'Accrued expense: a liability is recognised without VAT, as no invoice has been received.'),
      ],
      explanation: [
        'This is an accrued expense: the goods or services were received before the closing date but not yet invoiced.',
        'The entry is recorded excluding VAT, because the deduction can only be established once the invoice is received.',
        'On 1 January 2027 the entry is reversed and the actual invoice is recorded, so the expense falls on the right year.',
      ],
    },
    {
      kind: 'entry',
      id: 'e01-9',
      points: 2,
      topic: 'Income tax and profit distribution',
      prompt:
        '9) The accounting profit before tax for 2026 is €118,000 and the taxable income is equal to that amount. Record the corporate income tax for 2026. Then record the allocation decided by the general meeting: 45% of the net income of 2026 distributed to the shareholders and the remainder transferred to reserves. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '69', 'Corporate income tax', 29500, 'debit', 'Tax of 118,000 × 25% = 29,500; income tax is a transaction of the year it relates to.'),
        line('2026-12-31', 'LIABILITY', '44', 'State – Corporate income tax', 29500, 'credit', 'The tax is payable to the State and settled during 2027.'),
        line('2026-12-31', 'LIABILITY', '12', 'Profit/Loss for the year', 88500, 'debit', 'Net income to be allocated: 118,000 − 29,500 = 88,500; account 12 is cleared.'),
        line('2026-12-31', 'LIABILITY', '11', 'Retained earnings', 48675, 'credit', 'Portion kept in the company: 88,500 − 39,825 = 48,675.'),
        line('2026-12-31', 'LIABILITY', '45', 'Shareholders – Dividends payable', 39825, 'credit', 'Dividends: 88,500 × 45% = 39,825, a debt to the shareholders until paid.'),
      ],
      explanation: [
        'Income tax = €118,000 × 25% = €29,500, recorded as an expense against income tax payable.',
        'Net income = €118,000 − €29,500 = €88,500.',
        'Dividends = €88,500 × 45% = €39,825; reserves = €88,500 − €39,825 = €48,675.',
        'The allocation of the result is the last entry of the financial year: account 12 is cleared against account 11 and account 45.',
        'Paying the dividends in 2027 will simply clear account 45 against the bank, with no impact on the income statement.',
      ],
    },
  ],
};

export const EXAM_01 = buildExam(blueprint);
