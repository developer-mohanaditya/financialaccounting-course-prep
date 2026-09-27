import { buildExam, L as line, type ExamBlueprint } from '../examKit';

const blueprint: ExamBlueprint = {
  id: 'exam-06',
  number: 6,
  company: 'Orangerie Bio',
  caseHeading: 'Orangerie case',
  summary: 'Organic food wholesaler preparing its year-end entries and cash flow statement.',
  topics: [
    'Cash flow statement',
    'Fixed assets and depreciation',
    'Accrued income',
    'Sales and VAT',
    'Disposal of fixed assets',
    'Deferred income',
    'Payroll',
    'Inventory write-down',
    'Income tax and profit distribution',
  ],
  introParagraphs: [
    'Orangerie Bio is a limited liability company (SARL) founded in 2014. It distributes organic groceries to restaurants and delicatessens. Its closing date is December 31. Apply a VAT rate of 20% where necessary and an income tax rate of 25%.',
    'It is now February 2027; you are an intern at the company and the manager has asked you to record the entries for the financial year ended December 31, 2026 that had not yet been booked.',
  ],
  mcqIds: ['d05', 'a36', 'd01', 'b12', 'a26', 'c07', 'd07', 'b21', 'a45', 'd16'],
  items: [
    {
      kind: 'schedule',
      id: 'e06-1',
      points: 2,
      topic: 'Cash flow statement',
      prompt:
        '1) Using the information below, complete the extract of the cash flow statement for 2026 (direct method). Enter the outflows as positive amounts in the “Cash outflows” column. (2 pts)',
      context: {
        caption: 'Cash information for 2026',
        columns: ['Item', 'Amount (€)'],
        rows: [
          ['Trade receivables at 31/12/2025, collected in full in January 2026', 86000],
          ['Trade payables at 31/12/2025, paid in full in January 2026', 54000],
          ['Income tax payable at 31/12/2025, paid in June 2026', 18000],
          ['Sales revenue for 2026, of which 85% was collected during the year', 960000],
          ['Purchases of merchandise in 2026, of which 80% was paid during the year', 462000],
          ['Other operating expenses for 2026, paid in full', 128000],
          ['Personnel expenses for 2026, of which 12 000 of contributions remained payable', 214000],
          ['Interest paid in 2026', 5400],
          ['Acquisitions of PP&E paid during 2026', 46000],
          ['Proceeds from the disposal of the van (question 5)', 12000],
          ['Repayment of borrowings in 2026', 20000],
          ['Dividends allocated to the result of 2025, paid in June 2026', 74400],
          ['Cash at 1 January 2026', 31000],
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
          given: { in: '86 000' },
        },
        {
          key: 'cfs-pay-2025',
          label: 'Payments on trade payables as at 31/12/2025',
          cells: { in: null, out: null },
          given: { out: '54 000' },
        },
        {
          key: 'cfs-tax-2025',
          label: 'Payment of income tax payable as at 31/12/2025',
          cells: { in: null, out: null },
          given: { out: '18 000' },
        },
        {
          key: 'cfs-sales',
          label: 'Cash collections from 2026 sales',
          cells: { in: 816000, out: null },
        },
        {
          key: 'cfs-purchases',
          label: 'Payments for merchandise purchases in 2026',
          cells: { in: null, out: 369600 },
        },
        {
          key: 'cfs-other',
          label: 'Payments for other operating expenses in 2026',
          cells: { in: null, out: null },
          given: { out: '128 000' },
        },
        {
          key: 'cfs-personnel',
          label: 'Payments for salaries and social security contributions in 2026',
          cells: { in: null, out: 202000 },
        },
        {
          key: 'cfs-interest',
          label: 'Interest paid in 2026',
          cells: { in: null, out: 5400 },
        },
        {
          key: 'cfs-operating',
          label: 'Net cash flow from operating activities',
          cells: { in: 125000, out: null },
          emphasis: true,
        },
        {
          key: 'cfs-investing',
          label: 'Net cash flow from investing activities',
          cells: { in: null, out: 34000 },
          emphasis: true,
        },
        {
          key: 'cfs-financing',
          label: 'Net cash flow from financing activities',
          cells: { in: null, out: 94400 },
          emphasis: true,
        },
        {
          key: 'cfs-net-change',
          label: 'Net change in cash',
          cells: { in: null, out: 3400 },
          emphasis: true,
        },
        {
          key: 'cfs-opening',
          label: 'Opening cash (1 January 2026)',
          cells: { in: null, out: null },
          given: { in: '31 000' },
        },
        {
          key: 'cfs-closing',
          label: 'Closing cash (31 December 2026)',
          cells: { in: 27600, out: null },
          emphasis: true,
        },
      ],
      explanation: [
        'Operating: only the current-year transactions still to be settled need computing. Cash collected from 2026 sales = 960,000 × 85% = €816,000. Payments for 2026 purchases = 462,000 × 80% = €369,600. Payments for personnel = 214,000 − 12,000 still payable = €202,000. Interest paid €5,400.',
        'Net cash flow from operating activities = 86,000 − 54,000 − 18,000 + 816,000 − 369,600 − 128,000 − 202,000 − 5,400 = €125,000.',
        'Investing: acquisitions of PP&E are an outflow of €46,000 and the disposal proceeds an inflow of €12,000, giving 12,000 − 46,000 = −€34,000.',
        'Financing: dividends paid €74,400 and repayment of borrowings €20,000, with no new borrowing and no capital increase: −€94,400.',
        'Net change in cash = 125,000 − 34,000 − 94,400 = −€3,400. Adding the opening cash of €31,000 gives closing cash of €27,600, which must equal the bank and cash balances on the balance sheet at 31/12/2026.',
      ],
    },
    {
      kind: 'entry',
      id: 'e06-2',
      points: 2,
      topic: 'Fixed assets and depreciation',
      prompt:
        '2) Invoice dated 12/05/2026 for a refrigerated delivery van: €54,000 excluding tax plus delivery costs of €1,200 excluding tax, settled by bank transfer on the same date. The van was put into service on 1 June 2026 and is depreciated on a straight-line basis over 5 years. Record the entries for the acquisition and the depreciation. (2 pts)',
      lines: [
        line('2026-05-12', 'ASSET', '24', 'Tangible assets: transport', 55200, 'debit', 'Acquisition cost = 54,000 + 1,200 delivery cost, which is directly attributable to bringing the asset to its working condition.'),
        line('2026-05-12', 'ASSET', '44', 'Deductible VAT', 11040, 'debit', 'VAT of 20% on the capitalised amount: 55,200 × 20% = 11,040.'),
        line('2026-05-12', 'ASSET', '51', 'Bank', 66240, 'credit', 'Total settled: 55,200 + 11,040 = 66,240.'),
        line('2026-12-31', 'EXPENSE', '68', 'Depreciation charges', 6440, 'debit', 'Depreciation = 55,200 × (1/5) × 7/12 = 6,440, from the commissioning date of 1 June 2026.'),
        line('2026-12-31', 'ASSET', '28', 'Depreciation of tangible assets', 6440, 'credit', 'Net book value at 31/12/2026 = 55,200 − 6,440 = 48,760.'),
      ],
      explanation: [
        'Delivery costs are part of the acquisition cost: €54,000 + €1,200 = €55,200, with €11,040 of deductible VAT.',
        'Annual depreciation = €55,200 / 5 = €11,040, i.e. €920 per month.',
        'Seven months are depreciated in 2026 (June to December): €11,040 × 7/12 = €6,440.',
        'Check: debits 55,200 + 11,040 = 66,240 = credit 66,240. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e06-3',
      points: 1,
      topic: 'Accrued income',
      prompt:
        '3) A wholesale delivery worth €21,000 excluding tax was made on 29/12/2026 under a standing order from a restaurant chain. The invoice was issued on 8 January 2027. Record the adjusting entry, if necessary. (1 pt)',
      lines: [
        line('2026-12-31', 'ASSET', '41', 'Customers – Invoices to be issued', 21000, 'debit', 'The goods were delivered in 2026, so the right to invoice is an asset at the closing date.'),
        line('2026-12-31', 'REVENUE', '70', 'Sales', 21000, 'credit', 'Accrued income: the revenue belongs to 2026 and is recognised without VAT.'),
      ],
      explanation: [
        'Accrued income covers goods or services delivered or rendered before the closing date for which no invoice has been issued.',
        'No VAT can be recorded until the invoice is issued, so the entry is made excluding VAT.',
        'The entry is reversed on 1 January 2027 and the invoice of 8 January 2027 records the VAT and the receivable.',
      ],
    },
    {
      kind: 'entry',
      id: 'e06-4',
      points: 2,
      topic: 'Sales and VAT',
      prompt:
        '4) Revenue generated in October 2026: €132,000 excluding tax.\n- of which €52,800 incl. tax was received by bank transfer\n- of which €39,600 incl. tax was received by bank card\n- and the balance remains to be collected from customers. (2 pts)',
      lines: [
        line('2026-10-31', 'ASSET', '51', 'Bank', 92400, 'debit', 'Amounts collected including tax: 52,800 + 39,600 = 92,400.'),
        line('2026-10-31', 'ASSET', '41', 'Customers', 66000, 'debit', 'Balance to be collected: 158,400 − 92,400 = 66,000 including tax, i.e. €55,000 excluding tax.'),
        line('2026-10-31', 'REVENUE', '70', 'Sales', 132000, 'credit', 'Revenue is recognised excluding tax.'),
        line('2026-10-31', 'LIABILITY', '44', 'Collected VAT', 26400, 'credit', 'VAT collected: 132,000 × 20% = 26,400.'),
      ],
      explanation: [
        'Total invoiced including tax = €132,000 × 1.20 = €158,400.',
        'Cash collected = €52,800 + €39,600 = €92,400 including tax.',
        'Remaining receivable = €158,400 − €92,400 = €66,000 including tax, i.e. €55,000 excluding tax.',
        'Check: debits 92,400 + 66,000 = 158,400 = credits 132,000 + 26,400. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e06-5',
      points: 2,
      topic: 'Disposal of fixed assets',
      prompt:
        '5) A delivery van acquired on 01/10/2023 for €36,000 excluding tax and depreciated on a straight-line basis over 4 years was sold on 30/06/2026 for €9,500 excluding tax, settled by bank transfer on the same date. Record the depreciation for the year and the disposal. (2 pts)',
      lines: [
        line('2026-06-30', 'EXPENSE', '68', 'Depreciation charges', 4500, 'debit', 'Catch-up depreciation for 1 January to 30 June 2026: 9,000 × 6/12 = 4,500.'),
        line('2026-06-30', 'ASSET', '28', 'Depreciation of tangible assets', 4500, 'credit', 'Accumulated depreciation reaches 2,250 + 9,000 + 9,000 + 4,500 = 24,750 at the disposal date.'),
        line('2026-06-30', 'EXPENSE', '65', 'Net book value of assets disposed of', 11250, 'debit', 'Net book value = 36,000 − 24,750 = 11,250.'),
        line('2026-06-30', 'ASSET', '28', 'Depreciation of tangible assets', 24750, 'debit', 'The accumulated depreciation attached to the van is derecognised.'),
        line('2026-06-30', 'ASSET', '24', 'Tangible assets: transport', 36000, 'credit', 'The gross amount of the van leaves the balance sheet.'),
        line('2026-06-30', 'ASSET', '51', 'Bank', 11400, 'debit', 'Proceeds including tax: 9,500 + 1,900 VAT = 11,400.'),
        line('2026-06-30', 'REVENUE', '75', 'Proceeds from disposal of fixed assets', 9500, 'credit', 'The disposal price is recognised as revenue, excluding tax.'),
        line('2026-06-30', 'LIABILITY', '44', 'Collected VAT', 1900, 'credit', 'VAT of 20% on the disposal: 9,500 × 20% = 1,900.'),
      ],
      explanation: [
        'Annual depreciation = €36,000 / 4 = €9,000, i.e. €750 per month, starting 1 October 2023.',
        'Accumulated depreciation at 30/06/2026: 2023 (3 months) €2,250 + 2024 €9,000 + 2025 €9,000 + 2026 (6 months) €4,500 = €24,750.',
        'Net book value = €36,000 − €24,750 = €11,250. Proceeds = €9,500, so the disposal produces a loss of €1,750.',
        'Check: debits 11,250 + 24,750 = 36,000 = credit 36,000. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e06-6',
      points: 1,
      topic: 'Deferred income',
      prompt:
        '6) On 1 November 2026 the company invoiced a client €28,800 incl. tax for a six-month supply contract covering the period from 1 November 2026 to 30 April 2027. The invoice was recorded in full as revenue when it was issued. Record the adjusting entry at 31/12/2026. (1 pt)',
      lines: [
        line('2026-12-31', 'REVENUE', '70', 'Sales', 16000, 'debit', 'Only two months out of six relate to 2026, so the revenue of the year is reduced.'),
        line('2026-12-31', 'LIABILITY', '48', 'Deferred income', 16000, 'credit', 'Deferred income: the amount invoiced for goods or services not yet provided at the closing date.'),
      ],
      explanation: [
        'Amount excluding tax = €28,800 / 1.20 = €24,000, of which €4,800 of VAT was recorded when the invoice was issued.',
        'Two months out of six belong to 2026: €24,000 × 2/6 = €8,000 earned, so €24,000 − €8,000 = €16,000 is deferred.',
        'The adjustment is recorded without VAT, since the tax was already accounted for on the invoice.',
      ],
    },
    {
      kind: 'entry',
      id: 'e06-7',
      points: 2,
      topic: 'Payroll',
      prompt:
        '7) Accounting entry on 31/12/2026 for the December 2026 payroll and social security contributions. (2 pts)',
      context: {
        caption: 'December 2026 payroll summary',
        columns: ['Item', 'Amount (€)'],
        rows: [
          ['Gross salaries', 120000],
          ['Employee social security contributions (21%)', 25200],
          ['Employer social security contributions (40%)', 48000],
          ['Net salaries payable', 94800],
        ],
        emphasisRows: [3],
        align: ['left', 'right'],
      },
      lines: [
        line('2026-12-31', 'EXPENSE', '64', 'Staff remuneration', 120000, 'debit', 'Gross salaries of the month.'),
        line('2026-12-31', 'EXPENSE', '64', 'Employer social security contributions', 48000, 'debit', 'Employer share: 120,000 × 40% = 48,000.'),
        line('2026-12-31', 'LIABILITY', '42', 'Personnel – Remuneration payable', 94800, 'credit', 'Net salaries: 120,000 − 25,200 = 94,800.'),
        line('2026-12-31', 'LIABILITY', '43', 'Social security bodies', 73200, 'credit', 'Employee share 25,200 + employer share 48,000 = 73,200.'),
      ],
      explanation: [
        'Net salaries = €120,000 − €25,200 = €94,800.',
        'Total personnel expense = €120,000 + €48,000 = €168,000.',
        'The social bodies receive both shares: €25,200 + €48,000 = €73,200.',
        'Check: debits 120,000 + 48,000 = 168,000 = credits 94,800 + 73,200. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e06-8',
      points: 1,
      topic: 'Inventory write-down',
      prompt:
        '8) At 31/12/2026 the inventory includes 900 gift hampers purchased at €46 each. They can now only be sold for €39 each and selling costs of €3 per unit will be incurred. Record the entry, if necessary. (1 pt)',
      lines: [
        line('2026-12-31', 'EXPENSE', '68', 'Impairment charges on current assets (inventory or receivables)', 9000, 'debit', 'Write-down of 41,400 − 32,400 = 9,000.'),
        line('2026-12-31', 'ASSET', '39', 'Inventory write-down allowance', 9000, 'credit', 'The allowance brings the inventory down to its net realisable value.'),
      ],
      explanation: [
        'Acquisition cost = 900 × €46 = €41,400.',
        'Net realisable value = 900 × (€39 − €3) = 900 × €36 = €32,400, being the estimated selling price less the costs still to be incurred until sale.',
        'Impairment loss = €41,400 − €32,400 = €9,000, an operating expense with no cash effect.',
        'The allowance is presented in assets as a deduction from the inventory value.',
      ],
    },
    {
      kind: 'entry',
      id: 'e06-9',
      points: 2,
      topic: 'Income tax and profit distribution',
      prompt:
        '9) The accounting profit before tax for 2026 is €212,000 and the taxable income is equal to that amount. Record the corporate income tax for 2026 and the allocation decided by the general meeting: 45% of the net income distributed to the shareholders and the remainder transferred to reserves. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '69', 'Corporate income tax', 53000, 'debit', 'Income tax = 212,000 × 25% = 53,000.'),
        line('2026-12-31', 'LIABILITY', '44', 'State – Corporate income tax', 53000, 'credit', 'The tax is a debt to the State at the closing date.'),
        line('2026-12-31', 'LIABILITY', '12', 'Profit/Loss for the year', 159000, 'debit', 'Net income to allocate = 212,000 − 53,000 = 159,000.'),
        line('2026-12-31', 'LIABILITY', '11', 'Retained earnings', 87450, 'credit', 'Reserves receive 55% of the net income: 159,000 × 55% = 87,450.'),
        line('2026-12-31', 'LIABILITY', '45', 'Shareholders – Dividends payable', 71550, 'credit', 'Dividends: 159,000 × 45% = 71,550.'),
      ],
      explanation: [
        'Income tax = €212,000 × 25% = €53,000.',
        'Net income = €212,000 − €53,000 = €159,000.',
        'Dividends = €159,000 × 45% = €71,550; reserves = €159,000 − €71,550 = €87,450.',
        'The dividends recognised here will be paid during 2027 and will appear as a financing outflow of that year, not of 2026.',
      ],
    },
  ],
};

export const EXAM_06 = buildExam(blueprint);
