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
  id: 'exam-03',
  number: 3,
  company: 'Meridian Cycles',
  caseHeading: 'Meridian case',
  summary: 'Electric-bicycle retail and workshop SARL preparing its year-end entries.',
  topics: [
    'Inventory and cost of goods sold',
    'Fixed assets and depreciation',
    'Bank charges',
    'Sales and VAT',
    'Trade and settlement discounts',
    'Borrowings and interest',
    'Inventory write-down',
    'Dividend payment',
    'Income tax and profit distribution',
  ],
  introParagraphs: [
    'Meridian Cycles is a limited liability company (SARL) founded in 2018. It sells electric bicycles and runs a repair workshop. Its closing date is December 31. Apply a VAT rate of 20% where necessary and an income tax rate of 25%.',
    'It is now March 2027; you are an intern at the company and the manager has asked you to record the entries for the financial year ended December 31, 2026 that had not yet been booked.',
  ],
  mcqIds: ['a09', 'a33', 'c08', 'a22', 'd06', 'b06', 'a18', 'a49', 'c22', 'a11'],
  items: [
    {
      kind: 'entry',
      id: 'e03-1',
      points: 2,
      topic: 'Inventory',
      prompt:
        '1) Merchandise inventory amounted to €68,000 on 1 January 2026; purchases of merchandise during 2026 totalled €412,000 excluding tax; the physical inventory count on 31 December 2026 shows a merchandise inventory of €57,000. Record the entry cancelling the opening inventory and the entry recognising the closing inventory. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '60', 'Change in merchandise inventory', 68000, 'debit', 'The opening inventory is cancelled through the change account, which increases expenses.'),
        line('2026-12-31', 'ASSET', '37', 'Merchandise inventory', 68000, 'credit', 'The inventory carried at 1 January 2026 leaves the balance sheet.'),
        line('2026-12-31', 'ASSET', '37', 'Merchandise inventory', 57000, 'debit', 'The closing inventory is recognised at its cost.'),
        line('2026-12-31', 'EXPENSE', '60', 'Change in merchandise inventory', 57000, 'credit', 'The change account is credited, reducing the expenses of the year.'),
      ],
      explanation: [
        'Cost of goods sold = purchases + beginning inventory − closing inventory = 412,000 + 68,000 − 57,000 = €423,000.',
        'After the two entries, account 60 Change in merchandise inventory carries a net debit of 68,000 − 57,000 = €11,000, added to purchases in the income statement.',
        'Purchases 412,000 + change 11,000 = €423,000 = the cost of goods sold. ✔',
        'The physical count is mandatory at least once a year and provides the quantities that are then valued.',
      ],
    },
    {
      kind: 'entry',
      id: 'e03-2',
      points: 2,
      topic: 'Fixed assets and depreciation',
      prompt:
        '2) Invoice dated 01/07/2026 for workshop equipment: €28,800 incl. tax, settled by bank transfer on the same date. The equipment is put into service on 1 July 2026 and depreciated on a straight-line basis over 8 years. Record the entries for the acquisition and the depreciation. (2 pts)',
      lines: [
        line('2026-07-01', 'ASSET', '23', 'Tangible assets: factory equipment', 24000, 'debit', 'Acquisition cost excluding tax: 28,800 / 1.20 = 24,000.'),
        line('2026-07-01', 'ASSET', '44', 'Deductible VAT', 4800, 'debit', 'VAT of 20%: 24,000 × 20% = 4,800.'),
        line('2026-07-01', 'ASSET', '51', 'Bank', 28800, 'credit', 'The invoice is settled immediately, so no supplier account is created.'),
        line('2026-12-31', 'EXPENSE', '68', 'Depreciation charges', 1500, 'debit', 'Depreciation = 24,000 × (1/8) × 6/12 = 1,500, from the commissioning date of 1 July 2026.'),
        line('2026-12-31', 'ASSET', '28', 'Depreciation of tangible assets', 1500, 'credit', 'Net book value at 31/12/2026 = 24,000 − 1,500 = 22,500.'),
      ],
      explanation: [
        'Acquisition cost = €28,800 / 1.20 = €24,000, with €4,800 of deductible VAT.',
        'Straight-line rate = 100% / 8 = 12.5% per year, i.e. €3,000 for a full year.',
        'From the commissioning date of 1 July 2026, six months are depreciated: €3,000 × 6/12 = €1,500.',
        'The entry balances: debit 24,000 + 4,800 = 28,800 = credit 28,800. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e03-3',
      points: 1,
      topic: 'Bank charges',
      prompt:
        '3) On 31/03/2026 the bank debited the company’s account for €1,250 of charges relating to the first quarter. Bank charges are exempt from VAT. Record the entry. (1 pt)',
      lines: [
        line('2026-03-31', 'EXPENSE', '62', 'Bank charges', 1250, 'debit', 'Bank charges are an operating expense; being exempt, they are recorded at the invoiced amount with no VAT.'),
        line('2026-03-31', 'ASSET', '51', 'Bank', 1250, 'credit', 'The bank account decreases by the amount debited.'),
      ],
      explanation: [
        'Banking services are exempt from VAT, so no deductible VAT can be recorded.',
        'The charge reduces the profit of 2026 and cash, and it will appear as an operating outflow in the cash flow statement.',
      ],
    },
    {
      kind: 'entry',
      id: 'e03-4',
      points: 2,
      topic: 'Sales and VAT',
      prompt:
        '4) Revenue generated in November 2026: €156,000 excluding tax.\n- of which €54,000 excluding tax was settled immediately by bank card\n- of which €36,000 excluding tax was received by bank transfer\n- and the balance remains to be collected from customers. (2 pts)',
      lines: [
        line('2026-11-30', 'ASSET', '51', 'Bank', 108000, 'debit', 'Amounts already collected including tax: (54,000 + 36,000) × 1.20 = 108,000.'),
        line('2026-11-30', 'ASSET', '41', 'Customers', 79200, 'debit', 'Amount still to be collected: 187,200 − 108,000 = 79,200 including tax, i.e. €66,000 excluding tax.'),
        line('2026-11-30', 'REVENUE', '70', 'Sales', 156000, 'credit', 'Revenue is recognised excluding tax, when the goods are transferred and the services performed.'),
        line('2026-11-30', 'LIABILITY', '44', 'Collected VAT', 31200, 'credit', 'VAT collected: 156,000 × 20% = 31,200, a debt to the State.'),
      ],
      explanation: [
        'Total invoiced including tax = €156,000 × 1.20 = €187,200.',
        'Cash collected = (54,000 + 36,000) × 1.20 = €90,000 × 1.20 = €108,000.',
        'Remaining receivable = €187,200 − €108,000 = €79,200 including tax, i.e. €66,000 excluding tax.',
        'Check: debits 108,000 + 79,200 = 187,200 = credits 156,000 + 31,200. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e03-5',
      points: 2,
      topic: 'Cash discounts received',
      prompt:
        '5) Invoice dated 12/12/2026 for the purchase of merchandise: €24,000 excluding tax. The supplier offers a 1.5% discount for payment within eight days. The company settles the invoice by bank transfer on 18/12/2026 and takes the discount. Record the single entry for the purchase and its settlement. (2 pts)',
      lines: [
        line('2026-12-18', 'EXPENSE', '60', 'Purchases of merchandise', 24000, 'debit', 'Purchases are recorded at their full amount excluding tax; a settlement discount is not netted against the cost.'),
        line('2026-12-18', 'ASSET', '44', 'Deductible VAT', 4800, 'debit', 'VAT of 20% on €24,000 = €4,800.'),
        line('2026-12-18', 'REVENUE', '765', 'Cash discounts received', 432, 'credit', 'Discount of 1.5% on the amount including tax: 28,800 × 1.5% = 432, recognised as financial income.'),
        line('2026-12-18', 'ASSET', '51', 'Bank', 28368, 'credit', 'Amount actually paid: 28,800 − 432 = 28,368.'),
      ],
      explanation: [
        'Invoice including tax = €24,000 + €4,800 = €28,800.',
        'Discount = €28,800 × 1.5% = €432.',
        'Amount settled = €28,800 − €432 = €28,368.',
        'Check: debits 24,000 + 4,800 = 28,800 = credits 432 + 28,368. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e03-6',
      points: 2,
      topic: 'Borrowings and interest',
      prompt:
        '6) On 1 July 2024 the company took out a €120,000 loan repayable in six equal annual instalments of principal on 30 June each year, at an annual interest rate of 4% calculated on the outstanding principal. On 30/06/2026 the bank sent a direct debit notice for the second instalment. Record this notice, then the accrued interest at 31/12/2026 for the second half of 2026. (2 pts)',
      lines: [
        line('2026-06-30', 'LIABILITY', '16', 'Borrowings', 20000, 'debit', 'Principal instalment repaid: 120,000 / 6 = 20,000.'),
        line('2026-06-30', 'EXPENSE', '66', 'Financial expenses', 4000, 'debit', 'Interest for the year to 30 June 2026: outstanding principal 100,000 × 4% = 4,000.'),
        line('2026-06-30', 'ASSET', '51', 'Bank', 24000, 'credit', 'The direct debit is 20,000 + 4,000 = 24,000.'),
        line('2026-12-31', 'EXPENSE', '66', 'Financial expenses', 1600, 'debit', 'Interest accrued from 1 July to 31 December 2026 on the remaining 80,000: 80,000 × 4% × 6/12 = 1,600.'),
        line('2026-12-31', 'LIABILITY', '16', 'Accrued interest', 1600, 'credit', 'Accrued expense: the interest relates to 2026 but is charged by the bank on 30 June 2027.'),
      ],
      explanation: [
        'Annual principal instalment = €120,000 / 6 = €20,000. The first instalment on 30/06/2025 reduced the principal to €100,000.',
        'Interest for the year to 30 June 2026 = €100,000 × 4% = €4,000, so the direct debit is €24,000.',
        'After the instalment the outstanding principal is €100,000 − €20,000 = €80,000.',
        'Interest accrued for the second half of 2026 = €80,000 × 4% × 6/12 = €1,600, recognised as an accrued expense at 31/12/2026.',
        'Total financial expense for 2026 on this loan = 4,000 + 1,600 = €5,600.',
      ],
    },
    {
      kind: 'entry',
      id: 'e03-7',
      points: 1,
      topic: 'Inventory write-down',
      prompt:
        '7) At 31/12/2026 the inventory includes 40 helmets purchased at €95 each. Following a change in the safety standard they can now only be sold for €60 each, and selling costs of €4 per unit will be incurred. Record the entry, if necessary. (1 pt)',
      lines: [
        line('2026-12-31', 'EXPENSE', '68', 'Impairment charges on current assets (inventory or receivables)', 1560, 'debit', 'Write-down of 3,800 − 2,240 = 1,560.'),
        line('2026-12-31', 'ASSET', '39', 'Inventory write-down allowance', 1560, 'credit', 'The allowance reduces the net book value of the inventory to its net realisable value.'),
      ],
      explanation: [
        'Acquisition cost = 40 × €95 = €3,800.',
        'Net realisable value = 40 × (€60 − €4) = 40 × €56 = €2,240, i.e. the estimated selling price less the costs still to be incurred until sale.',
        'Because net realisable value is below cost, an impairment loss of €3,800 − €2,240 = €1,560 is recognised.',
        'The allowance is presented in assets as a deduction from the inventory, and the loss is an operating expense.',
      ],
    },
    {
      kind: 'entry',
      id: 'e03-8',
      points: 1,
      topic: 'Dividend payment',
      prompt:
        '8) The dividends allocated to the shareholders of Meridian at 31/12/2025 amounted to €45,000. They were paid by bank transfer on 20/05/2026. Record the payment. (1 pt)',
      lines: [
        line('2026-05-20', 'LIABILITY', '45', 'Shareholders – Dividends payable', 45000, 'debit', 'The debt to the shareholders is cleared.'),
        line('2026-05-20', 'ASSET', '51', 'Bank', 45000, 'credit', 'The bank account decreases by the amount distributed.'),
      ],
      explanation: [
        'The expense side was settled when the result of 2025 was allocated: dividends reduce the result of the year they come from, not the year in which they are paid.',
        'The payment therefore has no impact on profit and appears in financing activities in the cash flow statement.',
      ],
    },
    {
      kind: 'entry',
      id: 'e03-9',
      points: 2,
      topic: 'Income tax and profit distribution',
      prompt:
        '9) The accounting profit before tax for 2026 is €164,000. Taxable income is €181,000, the difference arising from €9,000 of fines imposed by an administrative authority and €8,000 of non-deductible depreciation on company cars. Record the corporate income tax for 2026 and the allocation decided by the general meeting: 50% of the net income distributed to the shareholders and the remainder transferred to reserves. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '69', 'Corporate income tax', 45250, 'debit', 'Tax = 181,000 × 25% = 45,250; it is computed on the taxable income, not on the accounting profit.'),
        line('2026-12-31', 'LIABILITY', '44', 'State – Corporate income tax', 45250, 'credit', 'The tax is payable to the State and settled during 2027.'),
        line('2026-12-31', 'LIABILITY', '12', 'Profit/Loss for the year', 118750, 'debit', 'Net income = 164,000 − 45,250 = 118,750; account 12 is cleared.'),
        line('2026-12-31', 'LIABILITY', '11', 'Retained earnings', 59375, 'credit', 'Reserves receive half of the net income: 59,375.'),
        line('2026-12-31', 'LIABILITY', '45', 'Shareholders – Dividends payable', 59375, 'credit', 'Dividends: 118,750 × 50% = 59,375.'),
      ],
      explanation: [
        'Taxable income = accounting profit before tax + non-deductible expenses − tax-exempt revenues = 164,000 + 9,000 + 8,000 = €181,000.',
        'Income tax = €181,000 × 25% = €45,250, recorded as an expense against income tax payable.',
        'Net income = €164,000 − €45,250 = €118,750.',
        'Dividends = €118,750 × 50% = €59,375 and reserves = €59,375.',
        'The distribution is possible only because the distributable profit is positive; reserves are not treasury and remain inside the company.',
      ],
    },
  ],
};

export const EXAM_03 = buildExam(blueprint);
