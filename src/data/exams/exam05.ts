import { buildExam, L as line, type ExamBlueprint } from '../examKit';

const blueprint: ExamBlueprint = {
  id: 'exam-05',
  number: 5,
  company: 'Cobalt Freight',
  caseHeading: 'Cobalt case',
  summary: 'Freight-forwarding company managing doubtful customers and a new loan.',
  topics: [
    'Impairment of trade receivables',
    'Fixed assets and depreciation',
    'Deferred income',
    'Payroll',
    'VAT return',
    'Bad debt write-off',
    'Borrowings and accrued interest',
    'Income tax and profit distribution',
  ],
  introParagraphs: [
    'Cobalt Freight is a public limited company (SA) founded in 2013. It organises road and sea freight for industrial shippers. Its closing date is December 31. Apply a VAT rate of 20% where necessary and an income tax rate of 25%.',
    'It is now February 2027; you are an intern in the accounting department and the chief accountant has asked you to record the entries for the financial year ended December 31, 2026 that had not yet been booked.',
  ],
  mcqIds: ['b15', 'b13', 'a35', 'c03', 'a29', 'd02', 'a10', 'b23', 'a17', 'd19'],
  items: [
    {
      kind: 'entry',
      id: 'e05-1',
      points: 2,
      topic: 'Impairment of trade receivables',
      prompt:
        '1) As of 31/12/2025 the trade receivable from customer Ardent (€18,000 incl. tax) carried a 30% loss allowance computed on the ex-VAT amount. During 2026 Ardent made a partial payment of €7,200 incl. tax. Record the entry for the partial payment, then the adjustment at 31/12/2026 when the estimated risk on the remaining balance is still 30%. (2 pts)',
      lines: [
        line('2026-12-31', 'ASSET', '51', 'Bank', 7200, 'debit', 'The partial payment received, including tax, increases the bank account.'),
        line('2026-12-31', 'ASSET', '41', 'Customers', 7200, 'credit', 'The customer account is reduced by the amount collected: 7,200 including tax, i.e. €6,000 excluding tax.'),
        line('2026-12-31', 'ASSET', '49', 'Impairment of customer accounts', 1800, 'debit', 'The allowance is reduced by 1,800: the remaining receivable is lower, so the risk in absolute terms has fallen.'),
        line('2026-12-31', 'REVENUE', '78', 'Reversals of impairment on current assets (inventory or receivables)', 1800, 'credit', 'The reversal increases operating income of the year.'),
      ],
      explanation: [
        'Ex-VAT amount of the original receivable = €18,000 / 1.20 = €15,000, so the allowance at 31/12/2025 was €15,000 × 30% = €4,500.',
        'Partial payment = €7,200 including tax, i.e. €6,000 excluding tax. Remaining receivable = €18,000 − €7,200 = €10,800 including tax, i.e. €9,000 excluding tax.',
        'Required allowance at 31/12/2026 = €9,000 × 30% = €2,700.',
        'Because the required allowance (€2,700) is below the allowance already recognised (€4,500), the difference of €4,500 − €2,700 = €1,800 is reversed and increases operating income.',
        'The VAT element of the receivable is never impaired, as it can be recovered from the tax authorities if the customer ultimately fails to pay.',
      ],
    },
    {
      kind: 'entry',
      id: 'e05-2',
      points: 2,
      topic: 'Fixed assets and depreciation',
      prompt:
        '2) Invoice dated 25/06/2026 for a handling truck: €84,000 excluding tax, settled in full by bank transfer on 30/06/2026. The truck was put into service on 1 July 2026 and is depreciated on a straight-line basis over 6 years. Record the entries for the acquisition and the depreciation. (2 pts)',
      lines: [
        line('2026-06-25', 'ASSET', '24', 'Tangible assets: transport', 84000, 'debit', 'Acquisition cost excluding tax; the truck is held for use in the activity over more than 12 months.'),
        line('2026-06-25', 'ASSET', '44', 'Deductible VAT', 16800, 'debit', 'VAT of 20%: 84,000 × 20% = 16,800.'),
        line('2026-06-25', 'ASSET', '51', 'Bank', 100800, 'credit', 'The invoice is settled in full on 30/06/2026, so the supplier account is cleared immediately; the total paid is 100,800.'),
        line('2026-12-31', 'EXPENSE', '68', 'Depreciation charges', 7000, 'debit', 'Depreciation = 84,000 × (1/6) × 6/12 = 7,000, from the commissioning date of 1 July 2026.'),
        line('2026-12-31', 'ASSET', '28', 'Depreciation of tangible assets', 7000, 'credit', 'Net book value at 31/12/2026 = 84,000 − 7,000 = 77,000.'),
      ],
      explanation: [
        'The truck is a tangible fixed asset recorded at its acquisition cost excluding tax, €84,000, with €16,800 of deductible VAT.',
        'Annual depreciation = €84,000 / 6 = €14,000, i.e. €1,166.67 per month.',
        'Six months are depreciated in 2026 (July to December): €14,000 × 6/12 = €7,000.',
        'Check: 84,000 + 16,800 = 100,800 = the amount debited from the bank. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e05-3',
      points: 1,
      topic: 'Deferred income',
      prompt:
        '3) On 15/12/2026 the company invoiced a client €14,400 incl. tax for a three-month storage service covering the period from 1 December 2026 to 28 February 2027. The invoice was recorded in full as revenue when it was issued. Record the adjusting entry at 31/12/2026. (1 pt)',
      lines: [
        line('2026-12-31', 'REVENUE', '70', 'Sales', 8000, 'debit', 'Only one month out of three was earned in 2026; the revenue of the year is reduced accordingly.'),
        line('2026-12-31', 'LIABILITY', '48', 'Deferred income', 8000, 'credit', 'Deferred income: an amount invoiced for goods or services not yet provided at the closing date.'),
      ],
      explanation: [
        'Amount excluding tax = €14,400 / 1.20 = €12,000; the VAT of €2,400 was correctly recorded when the invoice was issued.',
        'One month out of the three-month period falls in 2026: €12,000 × 1/3 = €4,000 earned, so €12,000 − €4,000 = €8,000 is deferred.',
        'The adjusting entry is recorded without VAT because the VAT was already accounted for on the invoice.',
        'On 1 January 2027 the entry is reversed, and the revenue of 2027 will be the €8,000 earned in January and February.',
      ],
    },
    {
      kind: 'entry',
      id: 'e05-4',
      points: 2,
      topic: 'Payroll',
      prompt:
        '4) Accounting entry on 31/12/2026 for the December 2026 payroll and social security contributions. (2 pts)',
      context: {
        caption: 'December 2026 payroll summary',
        columns: ['Item', 'Amount (€)'],
        rows: [
          ['Gross salaries', 108000],
          ['Employee social security contributions (22%)', 23760],
          ['Employer social security contributions (40%)', 43200],
          ['Net salaries payable', 84240],
        ],
        emphasisRows: [3],
        align: ['left', 'right'],
      },
      lines: [
        line('2026-12-31', 'EXPENSE', '64', 'Staff remuneration', 108000, 'debit', 'Gross salaries are the total pay earned by the employees before deductions.'),
        line('2026-12-31', 'EXPENSE', '64', 'Employer social security contributions', 43200, 'debit', 'Employer share: 108,000 × 40% = 43,200.'),
        line('2026-12-31', 'LIABILITY', '42', 'Personnel – Remuneration payable', 84240, 'credit', 'Net salaries owed to the employees: 108,000 − 23,760 = 84,240.'),
        line('2026-12-31', 'LIABILITY', '43', 'Social security bodies', 66960, 'credit', 'Employee share 23,760 + employer share 43,200 = 66,960 owed to the social bodies.'),
      ],
      explanation: [
        'Net salaries = gross salaries − employee contributions = €108,000 − €23,760 = €84,240.',
        'The company pays both shares to the social bodies, hence a single liability of €23,760 + €43,200 = €66,960.',
        'Total personnel expense = €108,000 + €43,200 = €151,200.',
        'Check: debits 108,000 + 43,200 = 151,200 = credits 84,240 + 66,960. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e05-5',
      points: 1,
      topic: 'VAT return',
      prompt:
        '5) At 31/12/2026 the company records the December VAT return: collected VAT of €37,600 and deductible VAT of €24,150. The VAT payable is settled by bank transfer on the same date. (1 pt)',
      lines: [
        line('2026-12-31', 'LIABILITY', '44', 'Collected VAT', 37600, 'debit', 'The VAT charged on sales is cleared from the liability account.'),
        line('2026-12-31', 'ASSET', '44', 'Deductible VAT', 24150, 'credit', 'The VAT recoverable on purchases and investments is cleared.'),
        line('2026-12-31', 'LIABILITY', '44', 'VAT payable', 13450, 'credit', 'VAT payable = 37,600 − 24,150 = 13,450.'),
        line('2026-12-31', 'LIABILITY', '44', 'VAT payable', 13450, 'debit', 'The debt to the State is settled on the same date.'),
        line('2026-12-31', 'ASSET', '51', 'Bank', 13450, 'credit', 'The bank account decreases by the VAT transferred to the tax authorities.'),
      ],
      explanation: [
        'VAT payable = collected VAT − deductible VAT = €37,600 − €24,150 = €13,450.',
        'VAT is neutral for the company: it never flows through the income statement, only through balance-sheet accounts.',
        'The VAT paid is an operating outflow in the cash flow statement, even though it never affected profit.',
      ],
    },
    {
      kind: 'entry',
      id: 'e05-6',
      points: 2,
      topic: 'Bad debt write-off',
      prompt:
        '6) Customer Feld has been placed in judicial liquidation. Its trade receivable of €9,600 incl. tax carries a loss allowance of €4,000 recognised in earlier years. Record the entry writing the receivable off. (2 pts)',
      lines: [
        line('2026-12-31', 'ASSET', '49', 'Impairment of customer accounts', 4000, 'debit', 'The allowance previously recognised is reversed: the risk is now a definitive loss.'),
        line('2026-12-31', 'EXPENSE', '65', 'Losses on bad debts', 4000, 'debit', 'Net cost of the bad debt after the allowance: 8,000 − 4,000 = 4,000.'),
        line('2026-12-31', 'ASSET', '44', 'Deductible VAT', 1600, 'debit', 'The VAT included in the receivable is recovered through the VAT return: 8,000 × 20% = 1,600.'),
        line('2026-12-31', 'ASSET', '41', 'Customers', 9600, 'credit', 'The receivable is removed from the balance sheet.'),
      ],
      explanation: [
        'Ex-VAT amount of the receivable = €9,600 / 1.20 = €8,000; the VAT included is €1,600.',
        'The allowance of €4,000 is reversed, so the additional charge to the income statement is the balance: €8,000 − €4,000 = €4,000.',
        'The VAT of €1,600 is recovered because the receivable has become definitively uncollectible.',
        'Check: debits 4,000 + 4,000 + 1,600 = 9,600 = credit 9,600. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e05-7',
      points: 2,
      topic: 'Borrowings and accrued interest',
      prompt:
        '7) On 1 September 2026 the company obtained a loan of €150,000 from THE BANK, repayable in five equal annual instalments of principal starting 1 September 2027, at an annual interest rate of 3.6%. Record the entry for the loan received and the interest accrued at 31/12/2026. (2 pts)',
      lines: [
        line('2026-09-01', 'ASSET', '51', 'Bank', 150000, 'debit', 'The principal is transferred to the company’s bank account.'),
        line('2026-09-01', 'LIABILITY', '16', 'Borrowings', 150000, 'credit', 'A financial debt is recognised in liabilities.'),
        line('2026-12-31', 'EXPENSE', '66', 'Financial expenses', 1800, 'debit', 'Interest for the four months to 31/12/2026: 150,000 × 3.6% × 4/12 = 1,800.'),
        line('2026-12-31', 'LIABILITY', '16', 'Accrued interest', 1800, 'credit', 'Accrued expense: the interest relates to 2026 but will be charged by the bank with the first instalment.'),
      ],
      explanation: [
        'Obtaining a loan increases cash without creating profit: the entry raises the bank account and a financial debt.',
        'Interest accrues from 1 September to 31 December 2026, i.e. four months, even though the bank has not yet charged it.',
        'Interest accrued = €150,000 × 3.6% × 4/12 = €1,800, recorded as an accrued expense.',
        'Full-year interest on the whole principal would be €5,400, gradually reduced as the principal is repaid.',
      ],
    },
    {
      kind: 'entry',
      id: 'e05-8',
      points: 1,
      topic: 'Payment of salaries',
      prompt:
        '8) The bank transfer of the December 2026 net salaries, for €84,240, was made on 31/12/2026. Record the entry for the payment. (1 pt)',
      lines: [
        line('2026-12-31', 'LIABILITY', '42', 'Personnel – Remuneration payable', 84240, 'debit', 'The debt to the employees is extinguished by the transfer.'),
        line('2026-12-31', 'ASSET', '51', 'Bank', 84240, 'credit', 'The bank account decreases by the net salaries paid.'),
      ],
      explanation: [
        'The personnel expense was recognised when the payroll was booked; paying the net salaries only clears the liability.',
        'The social contributions of €66,960 remain payable at the closing date and are presented among taxes and social security payables.',
        'The payment of salaries appears as an operating outflow in the cash flow statement.',
      ],
    },
    {
      kind: 'entry',
      id: 'e05-9',
      points: 2,
      topic: 'Income tax and profit distribution',
      prompt:
        '9) The accounting profit before tax for 2026 is €248,000 and the taxable income is equal to that amount. Record the corporate income tax for 2026 and the allocation decided by the general meeting: 40% of the net income distributed to the shareholders and the remainder transferred to reserves. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '69', 'Corporate income tax', 62000, 'debit', 'Income tax = 248,000 × 25% = 62,000.'),
        line('2026-12-31', 'LIABILITY', '44', 'State – Corporate income tax', 62000, 'credit', 'The tax is payable at the closing date and settled during 2027.'),
        line('2026-12-31', 'LIABILITY', '12', 'Profit/Loss for the year', 186000, 'debit', 'Net income to allocate = 248,000 − 62,000 = 186,000.'),
        line('2026-12-31', 'LIABILITY', '11', 'Retained earnings', 111600, 'credit', 'Reserves receive 60% of the net income: 186,000 × 60% = 111,600.'),
        line('2026-12-31', 'LIABILITY', '45', 'Shareholders – Dividends payable', 74400, 'credit', 'Dividends: 186,000 × 40% = 74,400.'),
      ],
      explanation: [
        'Income tax = €248,000 × 25% = €62,000, an expense of the year offset by income tax payable.',
        'Net income = €248,000 − €62,000 = €186,000.',
        'Dividends = €186,000 × 40% = €74,400; reserves = €186,000 × 60% = €111,600.',
        'The distribution requires a positive distributable profit: the net income of the year, plus retained earnings, less any statutory allocations and losses carried forward.',
      ],
    },
  ],
};

export const EXAM_05 = buildExam(blueprint);
