import { buildExam, L as line, type ExamBlueprint } from '../examKit';

const blueprint: ExamBlueprint = {
  id: 'exam-10',
  number: 10,
  company: 'Vertbois Nursery',
  caseHeading: 'Vertbois case',
  summary: 'Horticultural nursery completing a full year-end closing sequence.',
  topics: [
    'Inventory and cost of goods sold',
    'Depreciation of several assets',
    'Accrued expenses',
    'Sales and VAT',
    'Impairment of trade receivables',
    'Provisions and reversals',
    'Cash flow statement',
    'Income tax',
    'Profit distribution and dividend payment',
  ],
  introParagraphs: [
    'Vertbois Nursery is a limited liability company (SARL) founded in 2009. It grows ornamental shrubs and young trees for landscapers. Its closing date is December 31. Apply a VAT rate of 20% where necessary and an income tax rate of 25%.',
    'It is now March 2027; you are an intern at the company and the manager has asked you to complete the closing of the financial year ended December 31, 2026, whose last entries had not yet been booked.',
  ],
  mcqIds: ['a03', 'd24', 'a28', 'b07', 'a06', 'c13', 'd23', 'a50', 'b16', 'd08'],
  items: [
    {
      kind: 'entry',
      id: 'e10-1',
      points: 2,
      topic: 'Inventory',
      prompt:
        '1) Merchandise inventory amounted to €38,000 on 1 January 2026; purchases of merchandise during 2026 totalled €246,000 excluding tax; the physical inventory at 31 December 2026 shows a merchandise inventory of €44,500. Record the entry cancelling the opening inventory and the entry recognising the closing inventory. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '60', 'Change in merchandise inventory', 38000, 'debit', 'The opening inventory is cancelled through the change account.'),
        line('2026-12-31', 'ASSET', '37', 'Merchandise inventory', 38000, 'credit', 'The inventory held at 1 January 2026 leaves the balance sheet.'),
        line('2026-12-31', 'ASSET', '37', 'Merchandise inventory', 44500, 'debit', 'The closing inventory is recognised at its cost.'),
        line('2026-12-31', 'EXPENSE', '60', 'Change in merchandise inventory', 44500, 'credit', 'The change account is credited, reducing the expense of the year.'),
      ],
      explanation: [
        'Cost of goods sold = purchases + beginning inventory − closing inventory = 246,000 + 38,000 − 44,500 = €239,500.',
        'Account 60 Change in merchandise inventory carries a net credit of 44,500 − 38,000 = €6,500, a negative expense.',
        'Purchases 246,000 − change 6,500 = €239,500 = the cost of goods sold. ✔',
        'The physical count is mandatory at least once a year, whatever the inventory tracking system used in the course of the year.',
      ],
    },
    {
      kind: 'entry',
      id: 'e10-2',
      points: 2,
      topic: 'Depreciation of several assets',
      prompt:
        '2) Record the depreciation expense for 2026 on the following assets. (2 pts)',
      context: {
        caption: 'Non-current assets at 31/12/2026',
        columns: ['Asset', 'Gross amount (€)', 'Commissioning date', 'Useful life', 'Method'],
        rows: [
          ['Greenhouse structures', '220 000', '1 January 2016', '25 years', 'Straight-line'],
          ['Irrigation system', '48 000', '1 July 2025', '6 years', 'Straight-line'],
        ],
        align: ['left', 'right', 'left', 'left', 'left'],
      },
      lines: [
        line('2026-12-31', 'EXPENSE', '68', 'Depreciation charges', 8800, 'debit', 'Greenhouse structures: 220,000 × (1/25) = 8,800 for the year.'),
        line('2026-12-31', 'ASSET', '28', 'Depreciation of tangible assets', 8800, 'credit', 'Accumulated depreciation on the structures rises to 88,000 + 8,800 = 96,800.'),
        line('2026-12-31', 'EXPENSE', '68', 'Depreciation charges', 8000, 'debit', 'Irrigation system: 48,000 × (1/6) = 8,000; 2026 is its first full year.'),
        line('2026-12-31', 'ASSET', '28', 'Depreciation of tangible assets', 8000, 'credit', 'Accumulated depreciation on the irrigation system rises to 4,000 + 8,000 = 12,000.'),
      ],
      explanation: [
        'Greenhouse structures: useful life 25 years, so the rate is 100% / 25 = 4% and the annual depreciation is €220,000 × 4% = €8,800. The asset was commissioned on 1 January 2016, so 2026 is a full year.',
        'Irrigation system: useful life 6 years, so the annual depreciation is €48,000 / 6 = €8,000. Commissioned on 1 July 2025, it was depreciated for six months in 2025 (€4,000) and for a full year in 2026 (€8,000).',
        'Total depreciation expense for 2026 = €8,800 + €8,000 = €16,800.',
        'Depreciation is a non-cash expense: it reduces the profit of the year and the net book value of the assets without any movement in cash.',
      ],
    },
    {
      kind: 'entry',
      id: 'e10-3',
      points: 1,
      topic: 'Accrued expenses',
      prompt:
        '3) The December 2026 water and heating consumption of the greenhouses is estimated at €2,850 excluding tax. The supplier’s invoice will be issued in January 2027. Record the adjusting entry, if necessary. (1 pt)',
      lines: [
        line('2026-12-31', 'EXPENSE', '60', 'Energy purchases', 2850, 'debit', 'The consumption occurred in December 2026, so the expense belongs to the year.'),
        line('2026-12-31', 'LIABILITY', '40', 'Suppliers – Invoices not yet received', 2850, 'credit', 'Accrued expense: a liability is recognised without VAT.'),
      ],
      explanation: [
        'Accrued expense: goods or services received before the closing date for which the invoice has not yet been received.',
        'The entry is recorded without VAT, because the deduction can only be established once the invoice is received.',
        'The entry is reversed on 1 January 2027, so the invoice, when received, is charged only once and to the right year.',
      ],
    },
    {
      kind: 'entry',
      id: 'e10-4',
      points: 2,
      topic: 'Sales and VAT',
      prompt:
        '4) Revenue generated in November 2026: €104,000 excluding tax.\n- of which €28,800 incl. tax was received by bank transfer\n- of which €33,600 incl. tax was received by bank card\n- and the balance remains to be collected from customers. (2 pts)',
      lines: [
        line('2026-11-30', 'ASSET', '51', 'Bank', 62400, 'debit', 'Amounts collected: 28,800 + 33,600 = 62,400 including tax.'),
        line('2026-11-30', 'ASSET', '41', 'Customers', 62400, 'debit', 'Balance to be collected: 124,800 − 62,400 = 62,400 including tax, i.e. €52,000 excluding tax.'),
        line('2026-11-30', 'REVENUE', '70', 'Sales', 104000, 'credit', 'Revenue is recognised excluding tax.'),
        line('2026-11-30', 'LIABILITY', '44', 'Collected VAT', 20800, 'credit', 'VAT collected: 104,000 × 20% = 20,800.'),
      ],
      explanation: [
        'Total invoiced including tax = €104,000 × 1.20 = €124,800.',
        'Cash collected = €28,800 + €33,600 = €62,400 including tax, i.e. €52,000 excluding tax.',
        'Remaining receivable = €124,800 − €62,400 = €62,400 including tax, i.e. €52,000 excluding tax.',
        'Check: debits 62,400 + 62,400 = 124,800 = credits 104,000 + 20,800. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e10-5',
      points: 2,
      topic: 'Impairment of trade receivables',
      prompt:
        '5) As of 31/12/2025 the trade receivable from customer Gardenia (€24,000 incl. tax) carried a 25% loss allowance computed on the ex-VAT amount. During 2026 Gardenia paid €12,000 incl. tax. At 31/12/2026 the risk of non-payment on the remaining balance is estimated at 40%. Record the entry for the payment received and the adjustment to the allowance. (2 pts)',
      lines: [
        line('2026-12-31', 'ASSET', '51', 'Bank', 12000, 'debit', 'The payment received increases the bank account.'),
        line('2026-12-31', 'ASSET', '41', 'Customers', 12000, 'credit', 'The customer account is reduced: 12,000 including tax, i.e. €10,000 excluding tax.'),
        line('2026-12-31', 'ASSET', '49', 'Impairment of customer accounts', 1000, 'debit', 'The allowance is reduced from 5,000 to the required 4,000, i.e. by 1,000.'),
        line('2026-12-31', 'REVENUE', '78', 'Reversals of impairment on current assets (inventory or receivables)', 1000, 'credit', 'The reversal increases operating income of the year.'),
      ],
      explanation: [
        'At 31/12/2025: ex-VAT receivable = €24,000 / 1.20 = €20,000, so the allowance was €20,000 × 25% = €5,000.',
        'Payment received = €12,000 including tax, i.e. €10,000 excluding tax. Remaining receivable = €24,000 − €12,000 = €12,000 including tax, i.e. €10,000 excluding tax.',
        'Required allowance at 31/12/2026 = €10,000 × 40% = €4,000.',
        'Because the required allowance (€4,000) is below the allowance already recognised (€5,000), the difference of €1,000 is reversed and increases operating income.',
        'Note that the risk rate itself has risen from 25% to 40%; the allowance falls only because the receivable at risk is much smaller.',
      ],
    },
    {
      kind: 'entry',
      id: 'e10-6',
      points: 1,
      topic: 'Provisions',
      prompt:
        '6) A provision of €14,000 was recognised in 2024 for a dispute with a neighbour over water runoff. In November 2026 the case was settled and the probable outflow is now estimated at €9,500. Record the adjustment at 31/12/2026. (1 pt)',
      lines: [
        line('2026-12-31', 'LIABILITY', '15', 'Provisions for risks and charges', 4500, 'debit', 'The provision is reduced to the new best estimate: 14,000 − 9,500 = 4,500.'),
        line('2026-12-31', 'REVENUE', '78', 'Reversal of provision for risks and charges', 4500, 'credit', 'A decrease in the probable outflow is recognised as operating income of the year.'),
      ],
      explanation: [
        'The probable outflow has decreased compared with the previous financial year, so the provision is adjusted downwards.',
        'The release of €4,500 is a reversal of provision, recognised in operating income; it increases the profit of 2026 with no cash effect.',
        'The remaining provision of €9,500 stays in liabilities until the dispute is finally settled.',
      ],
    },
    {
      kind: 'schedule',
      id: 'e10-7',
      points: 2,
      topic: 'Cash flow statement',
      prompt:
        '7) Complete the extract of the cash flow statement for 2026 (direct method). Enter the outflows as positive amounts in the “Cash outflows” column. (2 pts)',
      context: {
        caption: 'Cash information for 2026',
        columns: ['Item', 'Amount (€)'],
        rows: [
          ['Trade receivables at 31/12/2025, collected in full in January 2026', 64000],
          ['Trade payables at 31/12/2025, paid in full in January 2026', 41000],
          ['Income tax payable at 31/12/2025, paid in June 2026', 27000],
          ['Sales revenue for 2026, of which 82% was collected during the year', 840000],
          ['Purchases of merchandise in 2026, of which 75% was paid during the year', 396000],
          ['Other operating expenses for 2026, paid in full', 94000],
          ['Personnel expenses for 2026, of which 9 000 of contributions remained payable', 198000],
          ['Interest paid in 2026', 4600],
          ['Acquisitions of PP&E paid during 2026', 62000],
          ['Proceeds from disposal of PP&E in 2026', 0],
          ['Proceeds from the issue of share capital in 2026', 15000],
          ['Repayment of borrowings in 2026', 28000],
          ['Cash at 1 January 2026', 48000],
        ],
        align: ['left', 'right'],
      },
      columns: [
        { key: 'in', label: 'Cash inflows (+)', kind: 'amount', width: '140px' },
        { key: 'out', label: 'Cash outflows (−)', kind: 'amount', width: '140px' },
      ],
      rows: [
        {
          key: 'cfs-recv-2025',
          label: 'Cash collections on trade receivables as at 31/12/2025',
          cells: { in: null, out: null },
          given: { in: '64 000' },
        },
        {
          key: 'cfs-pay-2025',
          label: 'Payments on trade payables as at 31/12/2025',
          cells: { in: null, out: null },
          given: { out: '41 000' },
        },
        {
          key: 'cfs-tax-2025',
          label: 'Payment of income tax payable as at 31/12/2025',
          cells: { in: null, out: null },
          given: { out: '27 000' },
        },
        { key: 'cfs-sales', label: 'Cash collections from 2026 sales', cells: { in: 688800, out: null } },
        { key: 'cfs-purchases', label: 'Payments for merchandise purchases in 2026', cells: { in: null, out: 297000 } },
        {
          key: 'cfs-other',
          label: 'Payments for other operating expenses in 2026',
          cells: { in: null, out: null },
          given: { out: '94 000' },
        },
        {
          key: 'cfs-personnel',
          label: 'Payments for salaries and social security contributions in 2026',
          cells: { in: null, out: 189000 },
        },
        {
          key: 'cfs-interest',
          label: 'Interest paid in 2026',
          cells: { in: null, out: null },
          given: { out: '4 600' },
        },
        {
          key: 'cfs-operating',
          label: 'Net cash flow from operating activities',
          cells: { in: 100200, out: null },
          emphasis: true,
        },
        {
          key: 'cfs-acquisitions',
          label: 'Acquisitions of PP&E',
          cells: { in: null, out: null },
          given: { out: '62 000' },
        },
        {
          key: 'cfs-proceeds',
          label: 'Proceeds from disposal of PP&E',
          cells: { in: null, out: null },
          given: { in: '0' },
        },
        {
          key: 'cfs-investing',
          label: 'Net cash flow from investing activities',
          cells: { in: null, out: 62000 },
          emphasis: true,
        },
        {
          key: 'cfs-capital',
          label: 'Proceeds from the issue of share capital',
          cells: { in: null, out: null },
          given: { in: '15 000' },
        },
        { key: 'cfs-dividends', label: 'Dividends paid', cells: { in: null, out: 42300 } },
        {
          key: 'cfs-repayment',
          label: 'Repayment of borrowings',
          cells: { in: null, out: null },
          given: { out: '28 000' },
        },
        {
          key: 'cfs-financing',
          label: 'Net cash flow from financing activities',
          cells: { in: null, out: 55300 },
          emphasis: true,
        },
        {
          key: 'cfs-net-change',
          label: 'Net change in cash',
          cells: { in: null, out: 17100 },
          emphasis: true,
        },
        {
          key: 'cfs-opening',
          label: 'Opening cash (1 January 2026)',
          cells: { in: null, out: null },
          given: { in: '48 000' },
        },
        {
          key: 'cfs-closing',
          label: 'Closing cash (31 December 2026)',
          cells: { in: 30900, out: null },
          emphasis: true,
        },
      ],
      explanation: [
        'Cash collected from 2026 sales = 840,000 × 82% = €688,800. Payments for 2026 purchases = 396,000 × 75% = €297,000. Payments for personnel = 198,000 − 9,000 still payable at the closing date = €189,000.',
        'Net cash flow from operating activities = 64,000 − 41,000 − 27,000 + 688,800 − 297,000 − 94,000 − 189,000 − 4,600 = €100,200.',
        'Investing: acquisitions of €62,000 and no disposal proceeds, so the net investing flow is −€62,000.',
        'Financing: capital increase €15,000, dividends paid €42,300 and repayment of borrowings €28,000, giving 15,000 − 42,300 − 28,000 = −€55,300.',
        'Net change in cash = 100,200 − 62,000 − 55,300 = −€17,100. Opening cash €48,000 less €17,100 gives closing cash of €30,900, which must reconcile with the cash balances on the balance sheet at 31/12/2026.',
      ],
    },
    {
      kind: 'entry',
      id: 'e10-8',
      points: 1,
      topic: 'Income tax',
      prompt:
        '8) The accounting profit before tax for 2026 is €150,000 and the taxable income is equal to that amount. Record the corporate income tax for 2026. (1 pt)',
      lines: [
        line('2026-12-31', 'EXPENSE', '69', 'Corporate income tax', 37500, 'debit', 'Income tax = 150,000 × 25% = 37,500.'),
        line('2026-12-31', 'LIABILITY', '44', 'State – Corporate income tax', 37500, 'credit', 'The tax is a debt to the State at the closing date and is settled during 2027.'),
      ],
      explanation: [
        'Income tax is an expense of the year to which it relates, measured on the taxable income rather than on the accounting profit.',
        'Net income for 2026 = €150,000 − €37,500 = €112,500.',
        'The tax is paid during 2027 and therefore appears as an operating outflow in the cash flow statement of that year.',
      ],
    },
    {
      kind: 'entry',
      id: 'e10-9',
      points: 2,
      topic: 'Profit distribution',
      prompt:
        '9) The general meeting allocated the net income of 2026: 40% distributed to the shareholders and the remainder transferred to reserves. Record the allocation. Then record the payment by bank transfer on 20/06/2026 of the dividends allocated to the result of 2025, amounting to €42,300. (2 pts)',
      lines: [
        line('2026-12-31', 'LIABILITY', '12', 'Profit/Loss for the year', 112500, 'debit', 'The result of 2026 is cleared: 150,000 − 37,500 = 112,500.'),
        line('2026-12-31', 'LIABILITY', '11', 'Retained earnings', 67500, 'credit', 'Reserves receive 60% of the net income: 112,500 × 60% = 67,500.'),
        line('2026-12-31', 'LIABILITY', '45', 'Shareholders – Dividends payable', 45000, 'credit', 'Dividends: 112,500 × 40% = 45,000.'),
        line('2026-06-20', 'LIABILITY', '45', 'Shareholders – Dividends payable', 42300, 'debit', 'The payment clears the debt recognised when the result of 2025 was allocated.'),
        line('2026-06-20', 'ASSET', '51', 'Bank', 42300, 'credit', 'The bank account decreases by the amount distributed.'),
      ],
      explanation: [
        'Net income of 2026 = €150,000 − €37,500 = €112,500, allocated as the last entry of the financial year.',
        'Dividends = €112,500 × 40% = €45,000; reserves = €112,500 × 60% = €67,500.',
        'The dividend payment of 20/06/2026 relates to the result of 2025, not to the allocation just recorded: it clears the dividends payable recognised at 31/12/2025.',
        'Paying dividends has no impact on profit but appears as a financing outflow in the cash flow statement.',
      ],
    },
  ],
};

export const EXAM_10 = buildExam(blueprint);
