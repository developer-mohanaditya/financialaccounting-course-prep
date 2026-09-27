import { buildExam, L as line, type ExamBlueprint } from '../examKit';

const blueprint: ExamBlueprint = {
  id: 'exam-07',
  number: 7,
  company: 'Helios Solar',
  caseHeading: 'Helios case',
  summary: 'Solar installer reviewing asset values, provisions and a new borrowing.',
  topics: [
    'Acquisition cost and training costs',
    'Impairment of fixed assets',
    'Provisions and reversals',
    'Cash discounts',
    'Dividend payment',
    'Borrowings and accrued interest',
    'Inventory and cost of goods sold',
    'Accrued expenses',
    'Income tax and profit distribution',
  ],
  introParagraphs: [
    'Helios Solar is a simplified joint-stock company (SAS) founded in 2019. It installs photovoltaic equipment for farmers and local authorities. Its closing date is December 31. Apply a VAT rate of 20% where necessary and an income tax rate of 25%.',
    'It is now February 2027; you are an intern at the company and the chief accountant has asked you to record the entries for the financial year ended December 31, 2026 that had not yet been booked.',
  ],
  mcqIds: ['a13', 'b10', 'b24', 'a20', 'd13', 'c10', 'a38', 'a31', 'c20', 'b01'],
  items: [
    {
      kind: 'entry',
      id: 'e07-1',
      points: 2,
      topic: 'Acquisition cost',
      prompt:
        '1) Invoice dated 04/03/2026 for lifting equipment: list price €64,000 excluding tax, trade discount of 7.5%, transport €1,800 excluding tax, installation and commissioning €3,000 excluding tax, and operator training €2,000 excluding tax. The invoice was settled by bank transfer on the same date. The equipment was put into service on 1 April 2026 and is depreciated on a straight-line basis over 8 years. Record the entries for the invoice and the depreciation. (2 pts)',
      context: {
        caption: 'Invoice summary, all amounts excluding tax',
        columns: ['Description', 'Amount (€)'],
        rows: [
          ['Lifting equipment, list price', 64000],
          ['Trade discount, 7.5%', -4800],
          ['Transport', 1800],
          ['Installation and commissioning', 3000],
          ['Operator training', 2000],
          ['Total excluding tax', 66000],
          ['VAT, 20%', 13200],
          ['Total including tax', 79200],
        ],
        emphasisRows: [5, 7],
        align: ['left', 'right'],
      },
      lines: [
        line('2026-03-04', 'ASSET', '23', 'Tangible assets: factory equipment', 64000, 'debit', 'Acquisition cost = 59,200 after the trade discount + 1,800 transport + 3,000 installation = 64,000. Training is excluded.'),
        line('2026-03-04', 'EXPENSE', '62', 'Training costs', 2000, 'debit', 'Training costs do not form part of the acquisition cost of an asset and are expensed.'),
        line('2026-03-04', 'ASSET', '44', 'Deductible VAT', 13200, 'debit', 'VAT of 20% on the whole invoice: 66,000 × 20% = 13,200.'),
        line('2026-03-04', 'ASSET', '51', 'Bank', 79200, 'credit', 'Total settled on the invoice date: 64,000 + 2,000 + 13,200 = 79,200.'),
        line('2026-12-31', 'EXPENSE', '68', 'Depreciation charges', 6000, 'debit', 'Depreciation = 64,000 × (1/8) × 9/12 = 6,000, from the commissioning date of 1 April 2026.'),
        line('2026-12-31', 'ASSET', '28', 'Depreciation of tangible assets', 6000, 'credit', 'Net book value at 31/12/2026 = 64,000 − 6,000 = 58,000.'),
      ],
      explanation: [
        'Trade discount = €64,000 × 7.5% = €4,800, giving a net purchase price of €59,200.',
        'Transport, installation and commissioning are directly attributable costs incurred to bring the asset to its working condition: 59,200 + 1,800 + 3,000 = €64,000.',
        'Operator training is specifically excluded from the acquisition cost, so €2,000 is an operating expense of the year.',
        'Depreciation starts on the commissioning date, 1 April 2026: nine months at €64,000 / 8 = €8,000 per year, so €8,000 × 9/12 = €6,000.',
        'Check on the invoice entry: debits 64,000 + 2,000 + 13,200 = 79,200 = credit 79,200. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e07-2',
      points: 2,
      topic: 'Impairment of fixed assets',
      prompt:
        '2) In December 2026 an impairment review of two assets was carried out:\n- the installation robot: gross amount €120,000, accumulated depreciation €72,000. Sold on the second-hand market it would realise €34,000 net of disposal costs; continuing to use it, the present value of its expected net cash flows is €39,000.\n- the workshop mezzanine: gross amount €48,000, accumulated depreciation €16,000; its recoverable amount is estimated at €29,000.\nRecord the entries required, if any. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '68', 'Impairment charges on tangible and intangible fixed assets', 9000, 'debit', 'Impairment loss on the robot: net book value 48,000 less recoverable amount 39,000 = 9,000.'),
        line('2026-12-31', 'ASSET', '29', 'Impairment of tangible assets', 9000, 'credit', 'The recoverable amount is below the net book value, so the asset is written down.'),
        line('2026-12-31', 'EXPENSE', '68', 'Impairment charges on tangible and intangible fixed assets', 3000, 'debit', 'Impairment loss on the mezzanine: net book value 32,000 less recoverable amount 29,000 = 3,000.'),
        line('2026-12-31', 'ASSET', '29', 'Impairment of tangible assets', 3000, 'credit', 'The write-down reduces the net book value to the recoverable amount.'),
      ],
      explanation: [
        'Robot: net book value = €120,000 − €72,000 = €48,000. Recoverable amount = the higher of fair value less costs of disposal (€34,000) and value in use (€39,000), i.e. €39,000.',
        'Because €48,000 > €39,000, an impairment loss of €9,000 is recognised and a new depreciation schedule is prepared on the reduced base.',
        'Mezzanine: net book value = €48,000 − €16,000 = €32,000, recoverable amount €29,000, so the impairment loss is €3,000.',
        'Total impairment charge for the year = €9,000 + €3,000 = €12,000, an operating expense with no cash effect.',
      ],
    },
    {
      kind: 'entry',
      id: 'e07-3',
      points: 1,
      topic: 'Provisions',
      prompt:
        '3) In 2024 the company recognised a provision of €18,000 for a dispute with a customer over a faulty installation. In October 2026 the probable cost of the dispute was reassessed at €11,000. Record the adjustment at 31/12/2026. (1 pt)',
      lines: [
        line('2026-12-31', 'LIABILITY', '15', 'Provisions for risks and charges', 7000, 'debit', 'The provision is reduced to the new best estimate: 18,000 − 11,000 = 7,000.'),
        line('2026-12-31', 'REVENUE', '78', 'Reversal of provision for risks and charges', 7000, 'credit', 'A decrease in the probable outflow is recognised as operating income of the year.'),
      ],
      explanation: [
        'The risk has decreased compared with the previous financial year, so the provision is adjusted downwards rather than maintained.',
        'The release of €7,000 is a reversal of provision, recognised in operating income: it increases the profit of 2026 without any cash effect.',
        'The remaining provision of €11,000 stays in liabilities until the dispute is settled.',
      ],
    },
    {
      kind: 'entry',
      id: 'e07-4',
      points: 2,
      topic: 'Cash discounts granted',
      prompt:
        '4) On 15/12/2026 the company invoiced installation services of €45,000 excluding tax and offered a 2% discount for immediate payment. The customer settled by bank transfer on the same date. Record the single entry for the invoice and its settlement. (2 pts)',
      lines: [
        line('2026-12-15', 'ASSET', '51', 'Bank', 52920, 'debit', 'Amount received: 54,000 − 1,080 = 52,920.'),
        line('2026-12-15', 'EXPENSE', '665', 'Cash discounts granted', 1080, 'debit', 'Settlement discount of 2% on the amount including tax: 54,000 × 2% = 1,080, a financial expense.'),
        line('2026-12-15', 'REVENUE', '70', 'Sales', 45000, 'credit', 'Revenue is recognised at its full amount excluding tax; the discount is not netted against it.'),
        line('2026-12-15', 'LIABILITY', '44', 'Collected VAT', 9000, 'credit', 'VAT collected on the services: 45,000 × 20% = 9,000.'),
      ],
      explanation: [
        'Amount invoiced including tax = €45,000 + €9,000 = €54,000.',
        'Settlement discount = €54,000 × 2% = €1,080, recognised as a financial expense (account 665) and not as a reduction of revenue.',
        'Cash received = €54,000 − €1,080 = €52,920.',
        'Check: debits 52,920 + 1,080 = 54,000 = credits 45,000 + 9,000. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e07-5',
      points: 1,
      topic: 'Dividend payment',
      prompt:
        '5) Dividends of €36,000, allocated to the result of 2025, were paid by bank transfer on 18/06/2026. Record the entry for the payment. (1 pt)',
      lines: [
        line('2026-06-18', 'LIABILITY', '45', 'Shareholders – Dividends payable', 36000, 'debit', 'The debt to the shareholders is cleared by the payment.'),
        line('2026-06-18', 'ASSET', '51', 'Bank', 36000, 'credit', 'The bank account decreases by the amount distributed.'),
      ],
      explanation: [
        'The allocation of the result of 2025 was recorded as the last entry of the 2025 financial year, creating the dividends payable.',
        'Paying them in 2026 has no impact on the profit of 2026: it is a financing outflow in the cash flow statement.',
      ],
    },
    {
      kind: 'entry',
      id: 'e07-6',
      points: 2,
      topic: 'Borrowings and accrued interest',
      prompt:
        '6) On 1 October 2026 the company drew down the second tranche of its bank facility: €90,000, repayable in full on 30 September 2030, bearing annual interest of 3.2% paid in arrears. Record the entry for the receipt of the funds and the interest accrued at 31/12/2026. (2 pts)',
      lines: [
        line('2026-10-01', 'ASSET', '51', 'Bank', 90000, 'debit', 'The funds are credited to the company’s bank account.'),
        line('2026-10-01', 'LIABILITY', '16', 'Borrowings', 90000, 'credit', 'A financial debt is recognised in liabilities.'),
        line('2026-12-31', 'EXPENSE', '66', 'Financial expenses', 720, 'debit', 'Interest for the three months to 31/12/2026: 90,000 × 3.2% × 3/12 = 720.'),
        line('2026-12-31', 'LIABILITY', '16', 'Accrued interest', 720, 'credit', 'Accrued expense: the interest relates to 2026 and is charged by the bank on 30 September 2027.'),
      ],
      explanation: [
        'Drawing down a loan increases cash and a financial debt simultaneously; it creates no profit.',
        'Interest runs from 1 October to 31 December 2026, i.e. three months: €90,000 × 3.2% × 3/12 = €720.',
        'A full year of interest on this tranche would be €2,880.',
        'The interest accrued is a liability at the closing date and appears as interest paid in the following year’s cash flow statement.',
      ],
    },
    {
      kind: 'entry',
      id: 'e07-7',
      points: 2,
      topic: 'Inventory',
      prompt:
        '7) Merchandise inventory amounted to €54,000 on 1 January 2026; purchases of merchandise during 2026 totalled €286,000 excluding tax; the physical inventory at 31 December 2026 shows a merchandise inventory of €61,500. Record the entry cancelling the opening inventory and the entry recognising the closing inventory. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '60', 'Change in merchandise inventory', 54000, 'debit', 'The opening inventory is cancelled through the change account.'),
        line('2026-12-31', 'ASSET', '37', 'Merchandise inventory', 54000, 'credit', 'The inventory held at 1 January 2026 leaves the balance sheet.'),
        line('2026-12-31', 'ASSET', '37', 'Merchandise inventory', 61500, 'debit', 'The closing inventory is recognised at its cost.'),
        line('2026-12-31', 'EXPENSE', '60', 'Change in merchandise inventory', 61500, 'credit', 'The change account is credited: the inventory has grown, so the expense of the year is reduced.'),
      ],
      explanation: [
        'Cost of goods sold = purchases + beginning inventory − closing inventory = 286,000 + 54,000 − 61,500 = €278,500.',
        'Account 60 Change in merchandise inventory carries a net credit of 61,500 − 54,000 = €7,500, i.e. a negative expense.',
        'Purchases 286,000 − change 7,500 = €278,500 = the cost of goods sold. ✔',
        'A rising inventory reduces the expense of the period: the goods bought but not yet sold are carried in the balance sheet.',
      ],
    },
    {
      kind: 'entry',
      id: 'e07-8',
      points: 1,
      topic: 'Accrued expenses',
      prompt:
        '8) The December 2026 electricity consumption of the workshop is estimated at €4,250 excluding tax. The supplier’s invoice will be issued in January 2027. Record the adjusting entry, if necessary. (1 pt)',
      lines: [
        line('2026-12-31', 'EXPENSE', '60', 'Energy purchases', 4250, 'debit', 'The consumption occurred in December 2026, so the expense belongs to 2026.'),
        line('2026-12-31', 'LIABILITY', '40', 'Suppliers – Invoices not yet received', 4250, 'credit', 'Accrued expense: a liability is recognised without VAT.'),
      ],
      explanation: [
        'Accrued expense: services received before the closing date for which the invoice has not yet been received.',
        'No VAT is recorded because the deduction cannot be established until the invoice arrives.',
        'The entry is reversed at the beginning of 2027, so the invoice is charged only once, and to the right year.',
      ],
    },
    {
      kind: 'entry',
      id: 'e07-9',
      points: 2,
      topic: 'Income tax and profit distribution',
      prompt:
        '9) The accounting profit before tax for 2026 is €196,000 and the taxable income is equal to that amount. Record the corporate income tax for 2026 and the allocation decided by the general meeting: 25% of the net income distributed to the shareholders and the remainder transferred to reserves. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '69', 'Corporate income tax', 49000, 'debit', 'Income tax = 196,000 × 25% = 49,000.'),
        line('2026-12-31', 'LIABILITY', '44', 'State – Corporate income tax', 49000, 'credit', 'The tax is payable to the State and settled during 2027.'),
        line('2026-12-31', 'LIABILITY', '12', 'Profit/Loss for the year', 147000, 'debit', 'Net income to allocate = 196,000 − 49,000 = 147,000.'),
        line('2026-12-31', 'LIABILITY', '11', 'Retained earnings', 110250, 'credit', 'Reserves receive 75% of the net income: 147,000 × 75% = 110,250.'),
        line('2026-12-31', 'LIABILITY', '45', 'Shareholders – Dividends payable', 36750, 'credit', 'Dividends: 147,000 × 25% = 36,750.'),
      ],
      explanation: [
        'Income tax = €196,000 × 25% = €49,000.',
        'Net income = €196,000 − €49,000 = €147,000.',
        'Dividends = €147,000 × 25% = €36,750; reserves = €147,000 − €36,750 = €110,250.',
        'Because the remainder is transferred to reserves, the profit stays inside the company and finances future investment; reserves are not treasury and cannot be spent.',
      ],
    },
  ],
};

export const EXAM_07 = buildExam(blueprint);
