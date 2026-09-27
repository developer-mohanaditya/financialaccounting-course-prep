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
  id: 'exam-02',
  number: 2,
  company: 'Bellecour Analytics',
  caseHeading: 'Bellecour case',
  summary: 'Data-analytics SAS investing in infrastructure and closing its accounts.',
  topics: [
    'Acquisition cost of fixed assets',
    'Depreciation',
    'Payroll',
    'VAT return',
    'Trade and settlement discounts',
    'Disposal of fixed assets',
    'Accrued income',
    'Income statement',
    'Provisions',
    'Income tax and profit distribution',
  ],
  introParagraphs: [
    'Bellecour Analytics is a simplified joint-stock company (SAS) founded in 2021. It builds reporting tools for industrial groups. Its closing date is December 31. Apply a VAT rate of 20% where necessary and an income tax rate of 25%.',
    'It is now February 2027; you are an intern in the accounting department and the chief accountant has asked you to record the entries for the financial year ended December 31, 2026 that had not yet been booked.',
  ],
  mcqIds: ['a14', 'a19', 'b02', 'c05', 'a27', 'd11', 'c12', 'b20', 'a42', 'c19'],
  items: [
    {
      kind: 'entry',
      id: 'e02-1',
      points: 2,
      topic: 'Acquisition cost and depreciation',
      prompt:
        '1) Invoice dated 05/10/2026 from supplier Cygnet for a production server. Record the entry for the invoice and its settlement, then the depreciation at 31 December 2026. The server is put into service on 1 November 2026 and depreciated on a straight-line basis over 3 years. (2 pts)',
      context: {
        caption: 'Invoice Cygnet no. 260451, all amounts excluding tax',
        columns: ['Description', 'Amount (€)'],
        rows: [
          ['Server (list price)', 48000],
          ['Trade discount, 5%', -2400],
          ['Delivery and handling', 1500],
          ['Configuration and installation', 2400],
          ['On-site training for the technical team (half-day)', 1800],
          ['Total excluding tax', 51300],
          ['VAT, 20%', 10260],
          ['Total including tax', 61560],
        ],
        emphasisRows: [5, 7],
        align: ['left', 'right'],
      },
      lines: [
        line('2026-10-05', 'ASSET', '25', 'Tangible assets: office equipment', 49500, 'debit', 'Acquisition cost = 45,600 (after the 5% discount) + 1,500 delivery + 2,400 installation = 49,500. Training is excluded.'),
        line('2026-10-05', 'EXPENSE', '62', 'Training costs', 1800, 'debit', 'Staff training costs are excluded from the acquisition cost and expensed immediately.'),
        line('2026-10-05', 'ASSET', '44', 'Deductible VAT', 10260, 'debit', 'VAT of 20% on the whole invoice: 51,300 × 20% = 10,260.'),
        line('2026-10-05', 'ASSET', '51', 'Bank', 61560, 'credit', 'The invoice is settled immediately, so no supplier account is created.'),
        line('2026-12-31', 'EXPENSE', '68', 'Depreciation charges', 2750, 'debit', 'Depreciation = 49,500 × (1/3) × 2/12 = 2,750: two months from the commissioning date of 1 November 2026.'),
        line('2026-12-31', 'ASSET', '28', 'Depreciation of tangible assets', 2750, 'credit', 'Net book value at 31/12/2026 = 49,500 − 2,750 = 46,750.'),
      ],
      explanation: [
        'Acquisition cost includes the purchase price after trade discounts plus every cost directly attributable to bringing the asset to its working condition: 48,000 − 2,400 + 1,500 + 2,400 = €49,500.',
        'Training costs, administrative overheads and general overheads are specifically excluded and are expensed (account 62 Training costs).',
        'Depreciation starts on the commissioning date: from 1 November to 31 December 2026, i.e. 2 months out of a 3-year life. 49,500 / 3 = 16,500 per full year, so 16,500 × 2/12 = €2,750.',
        'Check on the invoice entry: debits 49,500 + 1,800 + 10,260 = 61,560 = credit 61,560. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e02-2',
      points: 2,
      topic: 'Payroll',
      prompt:
        '2) Accounting entry on 31/12/2026 for December salaries and social security contributions. The bank transfer of the net salaries is made on 31/12/2026. (2 pts)',
      context: {
        caption: 'December 2026 payroll summary',
        columns: ['Item', 'Amount (€)'],
        rows: [
          ['Gross salaries', 96000],
          ['Employee social security contributions (21%)', 20160],
          ['Employer social security contributions (42%)', 40320],
          ['Net salaries payable', 75840],
        ],
        emphasisRows: [3],
        align: ['left', 'right'],
      },
      lines: [
        line('2026-12-31', 'EXPENSE', '64', 'Staff remuneration', 96000, 'debit', 'Gross salaries of the month.'),
        line('2026-12-31', 'EXPENSE', '64', 'Employer social security contributions', 40320, 'debit', 'Employer share: 96,000 × 42% = 40,320.'),
        line('2026-12-31', 'LIABILITY', '42', 'Personnel – Remuneration payable', 75840, 'credit', 'Net salaries: 96,000 − 20,160 = 75,840.'),
        line('2026-12-31', 'LIABILITY', '43', 'Social security bodies', 60480, 'credit', 'Employee share 20,160 + employer share 40,320 = 60,480 owed to the social bodies.'),
        line('2026-12-31', 'LIABILITY', '42', 'Personnel – Remuneration payable', 75840, 'debit', 'The transfer clears the debt to the employees.'),
        line('2026-12-31', 'ASSET', '51', 'Bank', 75840, 'credit', 'Only the net salaries leave the bank account on 31/12/2026.'),
      ],
      explanation: [
        'Net salaries = €96,000 − €20,160 = €75,840.',
        'Total personnel expense = €96,000 + €40,320 = €136,320.',
        'The social bodies receive both the employee share withheld from pay and the employer share: €20,160 + €40,320 = €60,480.',
        'The contributions remain payable at the closing date and are presented among taxes and social security payables.',
      ],
    },
    {
      kind: 'entry',
      id: 'e02-3',
      points: 1,
      topic: 'VAT return',
      prompt:
        '3) At 31/12/2026 the company records the December VAT return: collected VAT of €21,400 and deductible VAT of €12,900. The VAT payable is settled by bank transfer on the same date. (1 pt)',
      lines: [
        line('2026-12-31', 'LIABILITY', '44', 'Collected VAT', 21400, 'debit', 'The liability to the State for VAT charged on sales is cleared.'),
        line('2026-12-31', 'ASSET', '44', 'Deductible VAT', 12900, 'credit', 'The VAT recoverable on purchases is cleared against the VAT collected.'),
        line('2026-12-31', 'LIABILITY', '44', 'VAT payable', 8500, 'credit', 'VAT payable = 21,400 − 12,900 = 8,500.'),
        line('2026-12-31', 'LIABILITY', '44', 'VAT payable', 8500, 'debit', 'The debt to the State is settled.'),
        line('2026-12-31', 'ASSET', '51', 'Bank', 8500, 'credit', 'The bank account decreases by the VAT paid.'),
      ],
      explanation: [
        'VAT payable = collected VAT − deductible VAT = €21,400 − €12,900 = €8,500.',
        'VAT has no effect on profit: it is a neutral tax for the company, settled through the balance sheet only.',
        'Had the balance been negative, the company would have carried forward a VAT credit instead of paying.',
      ],
    },
    {
      kind: 'entry',
      id: 'e02-4',
      points: 2,
      topic: 'Discounts and sales',
      prompt:
        '4) Invoice dated 18/12/2026 for licence and integration services: €60,000 excluding tax. A trade discount of 5% applies. The customer settles by bank transfer on 27/12/2026 and takes a 2% settlement discount. Record the entries for the invoice and the payment. (2 pts)',
      lines: [
        line('2026-12-18', 'ASSET', '41', 'Customers', 68400, 'debit', 'Amount receivable including tax: net 57,000 + VAT 11,400 = 68,400.'),
        line('2026-12-18', 'REVENUE', '70', 'Sales', 57000, 'credit', 'Revenue net of the trade discount, excluding tax: 60,000 − 3,000 = 57,000.'),
        line('2026-12-18', 'LIABILITY', '44', 'Collected VAT', 11400, 'credit', 'VAT of 20% on the net amount: 57,000 × 20% = 11,400.'),
        line('2026-12-27', 'ASSET', '51', 'Bank', 67032, 'debit', 'Amount actually received: 68,400 − 1,368 = 67,032.'),
        line('2026-12-27', 'EXPENSE', '665', 'Cash discounts granted', 1368, 'debit', 'Settlement discount of 2% on the amount including tax: 68,400 × 2% = 1,368, a financial expense.'),
        line('2026-12-27', 'ASSET', '41', 'Customers', 68400, 'credit', 'The customer account is cleared for the full invoiced amount.'),
      ],
      explanation: [
        'Trade discount: €60,000 × 5% = €3,000, deducted from revenue. Net revenue = €57,000; VAT = €11,400; total invoiced = €68,400.',
        'Settlement discount: €68,400 × 2% = €1,368. This one is a financial expense (account 665), not a reduction of revenue.',
        'Cash received = €68,400 − €1,368 = €67,032.',
        'Check on the payment entry: debits 67,032 + 1,368 = 68,400 = credit 68,400. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e02-5',
      points: 2,
      topic: 'Disposal of fixed assets',
      prompt:
        '5) Production equipment acquired on 01/04/2023 for €54,000 excluding tax and depreciated on a straight-line basis over 6 years was sold on 30/09/2026 for €22,000 excluding tax, settled by bank transfer on the same date. Record the depreciation for the year and the disposal. (2 pts)',
      lines: [
        line('2026-09-30', 'EXPENSE', '68', 'Depreciation charges', 6750, 'debit', 'Catch-up depreciation for 1 January to 30 September 2026: 9,000 × 9/12 = 6,750.'),
        line('2026-09-30', 'ASSET', '28', 'Depreciation of tangible assets', 6750, 'credit', 'Accumulated depreciation reaches 6,750 + 9,000 + 9,000 + 6,750 = 31,500 at the disposal date.'),
        line('2026-09-30', 'EXPENSE', '65', 'Net book value of assets disposed of', 22500, 'debit', 'Net book value = 54,000 − 31,500 = 22,500; it is expensed rather than netted against the proceeds.'),
        line('2026-09-30', 'ASSET', '28', 'Depreciation of tangible assets', 31500, 'debit', 'The accumulated depreciation attached to the asset is derecognised.'),
        line('2026-09-30', 'ASSET', '23', 'Tangible assets: factory equipment', 54000, 'credit', 'The gross amount of the equipment leaves the balance sheet.'),
        line('2026-09-30', 'ASSET', '51', 'Bank', 26400, 'debit', 'Proceeds including tax: 22,000 + 4,400 VAT = 26,400 received on the same date.'),
        line('2026-09-30', 'REVENUE', '75', 'Proceeds from disposal of fixed assets', 22000, 'credit', 'The disposal price is recognised as revenue, excluding tax.'),
        line('2026-09-30', 'LIABILITY', '44', 'Collected VAT', 4400, 'credit', 'VAT of 20% on the sale of the asset: 22,000 × 20% = 4,400.'),
      ],
      explanation: [
        'Annual depreciation = €54,000 / 6 = €9,000, so €750 per month.',
        'Accumulated depreciation at 30/09/2026: 2023 (9 months) 6,750 + 2024 9,000 + 2025 9,000 + 2026 (9 months) 6,750 = €31,500.',
        'Net book value = €54,000 − €31,500 = €22,500. Proceeds = €22,000, so the transaction produces a loss of €500.',
        'Under French GAAP the loss is not shown net: the net book value is an expense (account 65) and the proceeds are a revenue (account 75).',
        'Check on the derecognition entry: debits 22,500 + 31,500 = 54,000 = credit 54,000. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e02-6',
      points: 1,
      topic: 'Accrued income',
      prompt:
        '6) A client training session was delivered from 18 to 22 December 2026 for €14,000 excluding tax. The invoice was not issued until 6 January 2027. Record the adjusting entry, if necessary. (1 pt)',
      lines: [
        line('2026-12-31', 'ASSET', '41', 'Customers – Invoices to be issued', 14000, 'debit', 'The service was performed before the closing date, so the right to invoice is an asset at 31/12/2026.'),
        line('2026-12-31', 'REVENUE', '70', 'Sales', 14000, 'credit', 'Accrued income: the revenue belongs to 2026 and is recognised without VAT.'),
      ],
      explanation: [
        'This is accrued income: goods or services delivered before the closing date for which no invoice has been issued.',
        'The entry is recorded excluding VAT, as no invoice exists yet.',
        'The entry will be reversed on 1 January 2027 and replaced by the actual invoice, so the revenue falls only once, in 2026.',
      ],
    },
    {
      kind: 'schedule',
      id: 'e02-7',
      points: 2,
      topic: 'Income statement',
      prompt:
        '7) The preliminary figures for 2026 are given below. Complete the extract of the income statement for the financial year ended 31 December 2026. (2 pts)',
      context: {
        caption: 'Preliminary figures for 2026',
        columns: ['Item', 'Amount (€)'],
        rows: [
          ['Sales revenues', 720000],
          ['Other operating expenses', 268000],
          ['Personnel expenses', 312000],
          ['Depreciation expense', 41000],
          ['Financial expenses (interest on borrowings)', 6500],
        ],
        align: ['left', 'right'],
      },
      columns: [
        { key: 'expenses', label: 'EXPENSES', kind: 'amount', width: '130px' },
        { key: 'revenues', label: 'REVENUES', kind: 'amount', width: '130px' },
      ],
      rows: [
        { key: 'sales', label: 'Sales revenues', cells: { expenses: null, revenues: null }, given: { revenues: '720 000' } },
        { key: 'other', label: 'Other operating expenses', cells: { expenses: null, revenues: null }, given: { expenses: '268 000' } },
        { key: 'personnel', label: 'Personnel expenses', cells: { expenses: null, revenues: null }, given: { expenses: '312 000' } },
        { key: 'depreciation', label: 'Depreciation expense', cells: { expenses: null, revenues: null }, given: { expenses: '41 000' } },
        { key: 'total-op-ex', label: 'Total operating expenses', cells: { expenses: 621000, revenues: null }, emphasis: true },
        { key: 'operating-profit', label: 'Operating profit (revenues − expenses)', cells: { expenses: 99000, revenues: null }, emphasis: true },
        { key: 'financial', label: 'Total financial expenses', cells: { expenses: null, revenues: null }, given: { expenses: '6 500' } },
        { key: 'pbt', label: 'Profit before tax', cells: { expenses: 92500, revenues: null }, emphasis: true },
        { key: 'tax', label: 'Income tax expense (25%)', cells: { expenses: 23125, revenues: null } },
        { key: 'net', label: 'Net income (profit)', cells: { expenses: 69375, revenues: null }, emphasis: true },
      ],
      explanation: [
        'Total operating expenses = other operating expenses + personnel expenses + depreciation = 268,000 + 312,000 + 41,000 = €621,000.',
        'Operating profit = operating revenues − operating expenses = 720,000 − 621,000 = €99,000.',
        'Profit before tax = operating profit − financial expenses = 99,000 − 6,500 = €92,500.',
        'Income tax = €92,500 × 25% = €23,125 (taxable income is taken to be equal to the accounting profit before tax).',
        'Net income = 92,500 − 23,125 = €69,375. There is no financial income and no exceptional item in this extract.',
      ],
    },
    {
      kind: 'entry',
      id: 'e02-8',
      points: 1,
      topic: 'Provisions',
      prompt:
        '8) In November 2026 a former consultant brought a claim for wrongful termination against the company. The company’s lawyer considers that an adverse judgment is probable and estimates the compensation at €16,500. Record the entry, if any, at 31/12/2026. (1 pt)',
      lines: [
        line('2026-12-31', 'EXPENSE', '68', 'Provisions for financial risks and charges', 16500, 'debit', 'The probable outflow is an operating expense of the year in which the risk arose.'),
        line('2026-12-31', 'LIABILITY', '15', 'Provisions for risks and charges', 16500, 'credit', 'A liability of uncertain amount is recognised in the provisions section of the balance sheet.'),
      ],
      explanation: [
        'All the conditions for a provision are met: a present obligation at the closing date, a probable outflow, no equivalent consideration expected from the employee, and a reliably estimated amount.',
        'Had the cash outflow been neither required nor probable, the guarantee would have been disclosed in the annex instead of recognised.',
        'The provision has no cash effect at the closing date: it reduces the profit and increases liabilities only.',
      ],
    },
    {
      kind: 'entry',
      id: 'e02-9',
      points: 2,
      topic: 'Income tax and profit distribution',
      prompt:
        '9) The accounting profit before tax for 2026 is €92,500 and the taxable income is equal to that amount. Record the corporate income tax. Then record the allocation decided by the general meeting: 30% of the net income of 2026 distributed to the shareholders and the remainder transferred to reserves. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '69', 'Corporate income tax', 23125, 'debit', 'Income tax = 92,500 × 25% = 23,125.'),
        line('2026-12-31', 'LIABILITY', '44', 'State – Corporate income tax', 23125, 'credit', 'The tax is settled with the tax authorities during 2027.'),
        line('2026-12-31', 'LIABILITY', '12', 'Profit/Loss for the year', 69375, 'debit', 'Net income allocated: 92,500 − 23,125 = 69,375; account 12 is cleared.'),
        line('2026-12-31', 'LIABILITY', '11', 'Retained earnings', 48562.5, 'credit', 'Reserves keep 70% of the result: 69,375 × 70% = 48,562.50.'),
        line('2026-12-31', 'LIABILITY', '45', 'Shareholders – Dividends payable', 20812.5, 'credit', 'Dividends: 69,375 × 30% = 20,812.50, a debt to the shareholders.'),
      ],
      explanation: [
        'Income tax = €92,500 × 25% = €23,125, recorded as an expense against income tax payable.',
        'Net income = €92,500 − €23,125 = €69,375, matching the income statement prepared in question 7.',
        'Dividends = €69,375 × 30% = €20,812.50; reserves = €69,375 − €20,812.50 = €48,562.50.',
        'The allocation is the last entry of the financial year, so that the balance sheet closed at 31/12/2026 already shows reserves and dividends payable.',
      ],
    },
  ],
};

export const EXAM_02 = buildExam(blueprint);
