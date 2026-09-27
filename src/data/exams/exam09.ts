import { buildExam, L as line, type ExamBlueprint } from '../examKit';

const blueprint: ExamBlueprint = {
  id: 'exam-09',
  number: 9,
  company: 'Aquilon Marine',
  caseHeading: 'Aquilon case',
  summary: 'Boat maintenance and refit company recording a capital increase and a disposal.',
  topics: [
    'Disposal of fixed assets',
    'Fixed assets and depreciation',
    'Capital increase',
    'Sales and VAT',
    'Payroll',
    'Deferred income',
    'Borrowings and accrued interest',
    'Reversal of inventory write-down',
    'Income tax and profit distribution',
  ],
  introParagraphs: [
    'Aquilon Marine is a simplified joint-stock company (SAS) founded in 2015. It maintains and refits sailing yachts for private owners and charter companies. Its closing date is December 31. Apply a VAT rate of 20% where necessary and an income tax rate of 25%.',
    'It is now February 2027; you are an intern at the company and the chief accountant has asked you to record the entries for the financial year ended December 31, 2026 that had not yet been booked.',
  ],
  mcqIds: ['b03', 'a40', 'd21', 'c15', 'a44', 'b18', 'd25', 'a12', 'c06', 'b22'],
  items: [
    {
      kind: 'entry',
      id: 'e09-1',
      points: 2,
      topic: 'Disposal of fixed assets',
      prompt:
        '1) A boat-lifting crane acquired on 01/04/2024 for €60,000 excluding tax and depreciated on a straight-line basis over 5 years was sold on 31/10/2026 for €31,000 excluding tax, settled by bank transfer on the same date. Record the depreciation for the year and the disposal. (2 pts)',
      lines: [
        line('2026-10-31', 'EXPENSE', '68', 'Depreciation charges', 10000, 'debit', 'Catch-up depreciation for 1 January to 31 October 2026: 12,000 × 10/12 = 10,000.'),
        line('2026-10-31', 'ASSET', '28', 'Depreciation of tangible assets', 10000, 'credit', 'Accumulated depreciation reaches 9,000 + 12,000 + 10,000 = 31,000 at the disposal date.'),
        line('2026-10-31', 'EXPENSE', '65', 'Net book value of assets disposed of', 29000, 'debit', 'Net book value = 60,000 − 31,000 = 29,000.'),
        line('2026-10-31', 'ASSET', '28', 'Depreciation of tangible assets', 31000, 'debit', 'The accumulated depreciation attached to the crane is derecognised.'),
        line('2026-10-31', 'ASSET', '23', 'Tangible assets: factory equipment', 60000, 'credit', 'The gross amount of the crane leaves the balance sheet.'),
        line('2026-10-31', 'ASSET', '51', 'Bank', 37200, 'debit', 'Proceeds including tax: 31,000 + 6,200 VAT = 37,200.'),
        line('2026-10-31', 'REVENUE', '75', 'Proceeds from disposal of fixed assets', 31000, 'credit', 'The disposal price is recognised as revenue, excluding tax.'),
        line('2026-10-31', 'LIABILITY', '44', 'Collected VAT', 6200, 'credit', 'VAT of 20% on the disposal: 31,000 × 20% = 6,200.'),
      ],
      explanation: [
        'Annual depreciation = €60,000 / 5 = €12,000, i.e. €1,000 per month, starting 1 April 2024.',
        'Accumulated depreciation at 31/10/2026: 2024 (9 months) €9,000 + 2025 €12,000 + 2026 (10 months) €10,000 = €31,000.',
        'Net book value = €60,000 − €31,000 = €29,000. Proceeds = €31,000, so the disposal produces a gain of €2,000.',
        'The gain is not shown net: the income statement carries €29,000 of expense (account 65) and €31,000 of revenue (account 75).',
        'Check: debits 29,000 + 31,000 = 60,000 = credit 60,000. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e09-2',
      points: 2,
      topic: 'Fixed assets and depreciation',
      prompt:
        '2) Invoice dated 15/06/2026 for a workshop overhead crane: €96,000 excluding tax, settled by bank transfer on the same date. The crane was put into service on 1 July 2026 and is depreciated on a straight-line basis over 8 years. Record the entries for the acquisition and the depreciation. (2 pts)',
      lines: [
        line('2026-06-15', 'ASSET', '23', 'Tangible assets: factory equipment', 96000, 'debit', 'Acquisition cost excluding tax.'),
        line('2026-06-15', 'ASSET', '44', 'Deductible VAT', 19200, 'debit', 'VAT of 20% on €96,000 = €19,200.'),
        line('2026-06-15', 'ASSET', '51', 'Bank', 115200, 'credit', 'Total settled: 96,000 + 19,200 = 115,200.'),
        line('2026-12-31', 'EXPENSE', '68', 'Depreciation charges', 6000, 'debit', 'Depreciation = 96,000 × (1/8) × 6/12 = 6,000, from the commissioning date of 1 July 2026.'),
        line('2026-12-31', 'ASSET', '28', 'Depreciation of tangible assets', 6000, 'credit', 'Net book value at 31/12/2026 = 96,000 − 6,000 = 90,000.'),
      ],
      explanation: [
        'The crane is a tangible fixed asset recorded at its acquisition cost excluding tax, €96,000, with €19,200 of deductible VAT.',
        'Annual depreciation = €96,000 / 8 = €12,000, i.e. €1,000 per month.',
        'Six months are depreciated in 2026 (July to December): €12,000 × 6/12 = €6,000.',
        'Check: debits 96,000 + 19,200 = 115,200 = credit 115,200. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e09-3',
      points: 1,
      topic: 'Capital increase',
      prompt:
        '3) On 01/09/2026 the shareholders subscribed and paid a capital increase of €60,000, the funds being transferred to the account opened in the company’s name. Record the entry. (1 pt)',
      lines: [
        line('2026-09-01', 'ASSET', '51', 'Bank', 60000, 'debit', 'The funds contributed by the shareholders increase the bank account.'),
        line('2026-09-01', 'LIABILITY', '10', 'Capital', 60000, 'credit', 'Share capital increases by the nominal amount subscribed and paid.'),
      ],
      explanation: [
        'A capital increase settled in cash increases both the bank account and equity: the accounting equation stays balanced.',
        'It creates no profit and no expense; in the cash flow statement it is a financing inflow.',
        'Equity represents resources with no obligation to repay, which is what distinguishes it from a borrowing.',
      ],
    },
    {
      kind: 'entry',
      id: 'e09-4',
      points: 2,
      topic: 'Sales and VAT',
      prompt:
        '4) Revenue generated in September 2026: €120,000 excluding tax.\n- of which €43,200 incl. tax was received by bank transfer\n- of which €28,800 incl. tax was received by bank card\n- and the balance remains to be collected from customers. (2 pts)',
      lines: [
        line('2026-09-30', 'ASSET', '51', 'Bank', 72000, 'debit', 'Amounts collected: 43,200 + 28,800 = 72,000 including tax.'),
        line('2026-09-30', 'ASSET', '41', 'Customers', 72000, 'debit', 'Balance to be collected: 144,000 − 72,000 = 72,000 including tax, i.e. €60,000 excluding tax.'),
        line('2026-09-30', 'REVENUE', '70', 'Sales', 120000, 'credit', 'Revenue is recognised excluding tax, as the services are performed.'),
        line('2026-09-30', 'LIABILITY', '44', 'Collected VAT', 24000, 'credit', 'VAT collected: 120,000 × 20% = 24,000.'),
      ],
      explanation: [
        'Total invoiced including tax = €120,000 × 1.20 = €144,000.',
        'Cash collected = €43,200 + €28,800 = €72,000 including tax, i.e. €60,000 excluding tax.',
        'Remaining receivable = €144,000 − €72,000 = €72,000 including tax, i.e. €60,000 excluding tax.',
        'Check: debits 72,000 + 72,000 = 144,000 = credits 120,000 + 24,000. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e09-5',
      points: 2,
      topic: 'Payroll',
      prompt:
        '5) Accounting entry on 31/12/2026 for the December 2026 payroll and social security contributions. (2 pts)',
      context: {
        caption: 'December 2026 payroll summary',
        columns: ['Item', 'Amount (€)'],
        rows: [
          ['Gross salaries', 92000],
          ['Employee social security contributions (22%)', 20240],
          ['Employer social security contributions (42%)', 38640],
          ['Net salaries payable', 71760],
        ],
        emphasisRows: [3],
        align: ['left', 'right'],
      },
      lines: [
        line('2026-12-31', 'EXPENSE', '64', 'Staff remuneration', 92000, 'debit', 'Gross salaries of the month.'),
        line('2026-12-31', 'EXPENSE', '64', 'Employer social security contributions', 38640, 'debit', 'Employer share: 92,000 × 42% = 38,640.'),
        line('2026-12-31', 'LIABILITY', '42', 'Personnel – Remuneration payable', 71760, 'credit', 'Net salaries: 92,000 − 20,240 = 71,760.'),
        line('2026-12-31', 'LIABILITY', '43', 'Social security bodies', 58880, 'credit', 'Employee share 20,240 + employer share 38,640 = 58,880.'),
      ],
      explanation: [
        'Net salaries = €92,000 − €20,240 = €71,760.',
        'Total personnel expense = €92,000 + €38,640 = €130,640.',
        'The company pays both shares to the social bodies: €20,240 + €38,640 = €58,880.',
        'Check: debits 92,000 + 38,640 = 130,640 = credits 71,760 + 58,880. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e09-6',
      points: 1,
      topic: 'Deferred income',
      prompt:
        '6) On 1 December 2026 the company invoiced an annual maintenance contract of €21,600 incl. tax, covering the period from 1 December 2026 to 30 November 2027. The invoice was recorded in full as revenue when it was issued. Record the adjusting entry at 31/12/2026. (1 pt)',
      lines: [
        line('2026-12-31', 'REVENUE', '70', 'Sales', 16500, 'debit', 'Only one month out of twelve relates to 2026, so eleven months of revenue are deferred.'),
        line('2026-12-31', 'LIABILITY', '48', 'Deferred income', 16500, 'credit', 'Deferred income: an amount invoiced for services not yet provided at the closing date.'),
      ],
      explanation: [
        'Amount excluding tax = €21,600 / 1.20 = €18,000; the VAT of €3,600 was recorded when the invoice was issued.',
        'One month belongs to 2026: €18,000 × 1/12 = €1,500 earned, so €18,000 − €1,500 = €16,500 is deferred.',
        'The adjusting entry is recorded without VAT, as the tax was already accounted for on the invoice.',
        'At 31 December 2027 the whole contract will have been earned and the deferred income will be nil.',
      ],
    },
    {
      kind: 'entry',
      id: 'e09-7',
      points: 2,
      topic: 'Borrowings and accrued interest',
      prompt:
        '7) On 30/09/2026 the bank sent a direct debit notice for €33,000, corresponding to the annual instalment of principal of €28,000 and interest of €5,000 on the equipment loan. At 31/12/2026 the interest accrued since 1 October amounts to €1,750. Record the direct debit notice and the accrual. (2 pts)',
      lines: [
        line('2026-09-30', 'LIABILITY', '16', 'Borrowings', 28000, 'debit', 'The principal instalment reduces the financial debt.'),
        line('2026-09-30', 'EXPENSE', '66', 'Financial expenses', 5000, 'debit', 'Interest for the year elapsed, recognised as a financial expense.'),
        line('2026-09-30', 'ASSET', '51', 'Bank', 33000, 'credit', 'The direct debit is 28,000 + 5,000 = 33,000.'),
        line('2026-12-31', 'EXPENSE', '66', 'Financial expenses', 1750, 'debit', 'Interest accrued from 1 October to 31 December 2026.'),
        line('2026-12-31', 'LIABILITY', '16', 'Accrued interest', 1750, 'credit', 'Accrued expense: the interest belongs to 2026 but is charged with the next instalment.'),
      ],
      explanation: [
        'The direct debit notice mixes two different things: repayment of principal, which reduces the debt (€28,000), and interest, which is an expense of the period (€5,000).',
        'Total financial expense on this loan for 2026 = €5,000 + €1,750 = €6,750.',
        'The interest accrued at the closing date is a liability: without it, the profit of 2026 would be overstated.',
        'The repayment of principal is a financing outflow in the cash flow statement, while interest paid is presented in operating activities.',
      ],
    },
    {
      kind: 'entry',
      id: 'e09-8',
      points: 1,
      topic: 'Inventory write-down',
      prompt:
        '8) A write-down of €6,400 was recognised at 31/12/2025 on a batch of outboard motors. At 31/12/2026 the required write-down on that batch is €1,600. Record the adjustment. (1 pt)',
      lines: [
        line('2026-12-31', 'ASSET', '39', 'Inventory write-down allowance', 4800, 'debit', 'The allowance is reduced from 6,400 to 1,600, i.e. by 4,800.'),
        line('2026-12-31', 'REVENUE', '78', 'Reversals of impairment on current assets (inventory or receivables)', 4800, 'credit', 'The reversal increases operating income of the year.'),
      ],
      explanation: [
        'The risk of impairment has decreased, so the allowance is adjusted downwards: 6,400 − 1,600 = €4,800.',
        'Inventory is carried at the lower of cost and net realisable value; when the net realisable value recovers, the allowance is reversed.',
        'The reversal increases the profit of 2026 and has no cash effect.',
      ],
    },
    {
      kind: 'entry',
      id: 'e09-9',
      points: 2,
      topic: 'Income tax and profit distribution',
      prompt:
        '9) The accounting profit before tax for 2026 is €188,000 and the taxable income is equal to that amount. Record the corporate income tax for 2026 and the allocation decided by the general meeting: 30% of the net income distributed to the shareholders and the remainder transferred to reserves. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '69', 'Corporate income tax', 47000, 'debit', 'Income tax = 188,000 × 25% = 47,000.'),
        line('2026-12-31', 'LIABILITY', '44', 'State – Corporate income tax', 47000, 'credit', 'The tax is payable to the State at the closing date.'),
        line('2026-12-31', 'LIABILITY', '12', 'Profit/Loss for the year', 141000, 'debit', 'Net income to allocate = 188,000 − 47,000 = 141,000.'),
        line('2026-12-31', 'LIABILITY', '11', 'Retained earnings', 98700, 'credit', 'Reserves receive 70% of the net income: 141,000 × 70% = 98,700.'),
        line('2026-12-31', 'LIABILITY', '45', 'Shareholders – Dividends payable', 42300, 'credit', 'Dividends: 141,000 × 30% = 42,300.'),
      ],
      explanation: [
        'Income tax = €188,000 × 25% = €47,000.',
        'Net income = €188,000 − €47,000 = €141,000.',
        'Dividends = €141,000 × 30% = €42,300; reserves = €141,000 − €42,300 = €98,700.',
        'The allocation is recorded as the last entry of the financial year, so account 12 is cleared and the balance sheet at 31/12/2026 shows the reserves and the dividends payable.',
      ],
    },
  ],
};

export const EXAM_09 = buildExam(blueprint);
