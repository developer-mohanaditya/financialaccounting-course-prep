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
  id: 'exam-04',
  number: 4,
  company: 'Atelier Ravel',
  caseHeading: 'Ravel case',
  summary: 'Bespoke furniture workshop closing its books after a year of investment.',
  topics: [
    'Raw material inventory and consumption',
    'Acquisition cost and acquisition entry',
    'Depreciation schedule',
    'Insurance premiums',
    'Sales and VAT',
    'Disposal of fixed assets',
    'Warranty provisions',
    'Accrued expenses',
    'Income tax and profit distribution',
  ],
  introParagraphs: [
    'Atelier Ravel is a simplified joint-stock company (SASU) founded in 2016. It manufactures bespoke upholstered furniture for hotels. Its closing date is December 31. Apply a VAT rate of 20% where necessary and an income tax rate of 25%.',
    'It is now February 2027; you are an intern at the company and the chief accountant has asked you to record the entries for the financial year ended December 31, 2026 that had not yet been booked.',
  ],
  mcqIds: ['d09', 'a34', 'c11', 'b14', 'a07', 'a39', 'c23', 'a21', 'b17', 'c17'],
  items: [
    {
      kind: 'entry',
      id: 'e04-1',
      points: 2,
      topic: 'Inventory',
      prompt:
        '1) Raw materials inventory amounted to €42,000 on 1 January 2026; purchases of raw materials during 2026 totalled €318,000 excluding tax; the physical inventory at 31 December 2026 shows raw materials of €35,500. Record the entry cancelling the opening inventory and the entry recognising the closing inventory. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '60', 'Change in raw material inventory', 42000, 'debit', 'The opening inventory is cancelled, increasing the consumption of the year.'),
        line('2026-12-31', 'ASSET', '31', 'Raw materials inventory', 42000, 'credit', 'The inventory carried at 1 January 2026 leaves the balance sheet.'),
        line('2026-12-31', 'ASSET', '31', 'Raw materials inventory', 35500, 'debit', 'The closing inventory is recognised at its cost.'),
        line('2026-12-31', 'EXPENSE', '60', 'Change in raw material inventory', 35500, 'credit', 'The change account is credited, reducing the expenses of the year.'),
      ],
      explanation: [
        'Consumption of raw materials = purchases + beginning inventory − closing inventory = 318,000 + 42,000 − 35,500 = €324,500.',
        'After the two entries, account 60 Change in raw material inventory carries a net debit of 42,000 − 35,500 = €6,500.',
        'Purchases 318,000 + change 6,500 = €324,500, the cost of raw materials consumed. ✔',
        'Raw materials are held for use in the production process, so they are classified in inventory (current assets) rather than as fixed assets.',
      ],
    },
    {
      kind: 'entry',
      id: 'e04-2',
      points: 2,
      topic: 'Acquisition cost and depreciation',
      prompt:
        '2) Invoice dated 08/09/2026 for a new sewing machine: list price €42,000 excluding tax, with a trade discount of 6%, and transport and installation of €2,600 excluding tax. The invoice was settled by bank transfer on the same date. The machine was put into service on 1 October 2026 and is depreciated on a straight-line basis over 5 years. Record the entries for the acquisition and the depreciation. (2 pts)',
      lines: [
        line('2026-09-08', 'ASSET', '23', 'Tangible assets: factory equipment', 42080, 'debit', 'Acquisition cost = 42,000 × 94% + 2,600 = 39,480 + 2,600 = 42,080; transport and installation are directly attributable costs.'),
        line('2026-09-08', 'ASSET', '44', 'Deductible VAT', 8416, 'debit', 'VAT of 20% on the capitalised amount: 42,080 × 20% = 8,416.'),
        line('2026-09-08', 'ASSET', '51', 'Bank', 50496, 'credit', 'Total settled: 42,080 + 8,416 = 50,496.'),
        line('2026-12-31', 'EXPENSE', '68', 'Depreciation charges', 2104, 'debit', 'Depreciation = 42,080 × (1/5) × 3/12 = 2,104, from the commissioning date of 1 October 2026.'),
        line('2026-12-31', 'ASSET', '28', 'Depreciation of tangible assets', 2104, 'credit', 'Net book value at 31/12/2026 = 42,080 − 2,104 = 39,976.'),
      ],
      explanation: [
        'Trade discount = €42,000 × 6% = €2,520, so the net purchase price is €39,480.',
        'Transport, installation and assembly costs are included in the acquisition cost because they are incurred to bring the asset to its working condition: €39,480 + €2,600 = €42,080.',
        'Straight-line depreciation = €42,080 / 5 = €8,416 for a full year, i.e. €701.33 per month.',
        'Three months are depreciated in 2026 (October, November, December): €8,416 × 3/12 = €2,104.',
        'Check on the acquisition entry: debit 42,080 + 8,416 = 50,496 = credit 50,496. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e04-3',
      points: 1,
      topic: 'Insurance premiums',
      prompt:
        '3) On 08/02/2026 the bank debited the company’s account with €2,850 for the annual workshop insurance premium. Insurance transactions are exempt from VAT. Record the entry. (1 pt)',
      lines: [
        line('2026-02-08', 'EXPENSE', '61', 'Insurance premiums', 2850, 'debit', 'Insurance is exempt from VAT, so the premium is recorded at its invoiced amount with no deductible VAT.'),
        line('2026-02-08', 'ASSET', '51', 'Bank', 2850, 'credit', 'The bank account is reduced by the direct debit.'),
      ],
      explanation: [
        'No VAT appears because insurance services are exempt: the whole €2,850 is a cost of the year covered.',
        'Had the premium covered a period extending beyond 31 December 2026, the portion relating to 2027 would have been carried forward as a prepaid expense.',
      ],
    },
    {
      kind: 'entry',
      id: 'e04-4',
      points: 2,
      topic: 'Sales and VAT',
      prompt:
        '4) Revenue generated in December 2026: €96,000 excluding tax.\n- of which €28,800 incl. tax was received by bank transfer\n- of which €19,200 incl. tax was received by bank card\n- and the balance remains to be collected from customers. (2 pts)',
      lines: [
        line('2026-12-31', 'ASSET', '51', 'Bank', 48000, 'debit', 'Amounts collected: 28,800 + 19,200 = 48,000 including tax.'),
        line('2026-12-31', 'ASSET', '41', 'Customers', 67200, 'debit', 'Balance to be collected: 115,200 − 48,000 = 67,200 including tax, i.e. €56,000 excluding tax.'),
        line('2026-12-31', 'REVENUE', '70', 'Sales', 96000, 'credit', 'Revenue is recognised excluding tax.'),
        line('2026-12-31', 'LIABILITY', '44', 'Collected VAT', 19200, 'credit', 'VAT collected: 96,000 × 20% = 19,200.'),
      ],
      explanation: [
        'Total invoiced including tax = €96,000 × 1.20 = €115,200.',
        'Cash collected = €28,800 + €19,200 = €48,000 including tax, i.e. €40,000 excluding tax.',
        'Remaining receivable = €115,200 − €48,000 = €67,200 including tax, i.e. €56,000 excluding tax.',
        'Check: debits 48,000 + 67,200 = 115,200 = credits 96,000 + 19,200. ✔',
      ],
    },
    {
      kind: 'schedule',
      id: 'e04-5',
      points: 2,
      topic: 'Depreciation schedule',
      prompt:
        '5) The dust-extraction unit was acquired on 1 October 2025 for €72,000 excluding tax, commissioned on the same date and depreciated on a straight-line basis over 4 years with no residual value. Complete its depreciation schedule. (2 pts)',
      context: {
        caption: 'Details of the asset',
        columns: ['Item', 'Value'],
        rows: [
          ['Acquisition date', '1 October 2025'],
          ['Acquisition cost, excluding tax', '72 000'],
          ['Residual value', '0'],
          ['Useful life', '4 years'],
          ['Depreciation method', 'Straight-line'],
        ],
        align: ['left', 'right'],
      },
      columns: [
        { key: 'expense', label: 'Depreciation expense', kind: 'amount', width: '130px' },
        { key: 'accumulated', label: 'Accumulated depreciation', kind: 'amount', width: '130px' },
        { key: 'nbv', label: 'Net book value', kind: 'amount', width: '130px' },
      ],
      rows: [
        {
          key: 'y2025',
          label: '2025 (1 October to 31 December)',
          cells: { expense: 4500, accumulated: 4500, nbv: 67500 },
        },
        {
          key: 'y2026',
          label: '2026',
          cells: { expense: 18000, accumulated: 22500, nbv: 49500 },
        },
        {
          key: 'y2027',
          label: '2027',
          cells: { expense: 18000, accumulated: 40500, nbv: 31500 },
        },
        {
          key: 'y2028',
          label: '2028',
          cells: { expense: 18000, accumulated: 58500, nbv: 13500 },
        },
        {
          key: 'y2029',
          label: '2029 (1 January to 30 September)',
          cells: { expense: 13500, accumulated: 72000, nbv: 0 },
        },
      ],
      explanation: [
        'Depreciable amount = €72,000 − €0 residual value = €72,000. Useful life 4 years, so the annual depreciation is €72,000 / 4 = €18,000, i.e. €1,500 per month.',
        '2025: three months from the commissioning date of 1 October: €1,500 × 3 = €4,500. Accumulated €4,500, net book value €72,000 − €4,500 = €67,500.',
        '2026, 2027 and 2028: twelve months each, €18,000. Accumulated rises to €22,500, €40,500 and €58,500; net book value falls to €49,500, €31,500 and €13,500.',
        '2029: the last nine months (1 January to 30 September) at €1,500 = €13,500, which brings accumulated depreciation to the full €72,000 and the net book value to €0.',
        'Check: €4,500 + €18,000 + €18,000 + €18,000 + €13,500 = €72,000 = the depreciable amount. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e04-6',
      points: 1,
      topic: 'Provisions',
      prompt:
        '6) The company gives a two-year warranty on every piece of furniture sold. Based on the warranty claims history, the estimated cost of the warranties granted during 2026 is €21,600. Record the entry, if any, at 31/12/2026. (1 pt)',
      lines: [
        line('2026-12-31', 'EXPENSE', '68', 'Provisions for financial risks and charges', 21600, 'debit', 'A present legal obligation with a probable outflow and a reliably estimated amount: a provision expense of the year.'),
        line('2026-12-31', 'LIABILITY', '15', 'Provisions for risks and charges', 21600, 'credit', 'The provision is a liability of uncertain maturity, presented in the provisions section.'),
      ],
      explanation: [
        'A statutory warranty on products sold meets all three criteria for recognising a liability: a present obligation at the closing date, a probable outflow of resources, and no consideration expected from the customer beyond the sale price.',
        'The amount is a best estimate rather than a known figure, which is what distinguishes a provision from an ordinary liability.',
        'There is no cash effect at the recognition date; the outflow will occur when the warranty claims are settled.',
      ],
    },
    {
      kind: 'entry',
      id: 'e04-7',
      points: 2,
      topic: 'Disposal of fixed assets',
      prompt:
        '7) The former delivery van, acquired on 01/07/2023 for €30,000 excluding tax and depreciated on a straight-line basis over 5 years, was sold on 31/03/2026 for €12,000 excluding tax, settled by bank transfer on the same date. Record the depreciation for the year and the disposal. (2 pts)',
      lines: [
        line('2026-03-31', 'EXPENSE', '68', 'Depreciation charges', 1500, 'debit', 'Catch-up depreciation for 1 January to 31 March 2026: 6,000 × 3/12 = 1,500.'),
        line('2026-03-31', 'ASSET', '28', 'Depreciation of tangible assets', 1500, 'credit', 'Accumulated depreciation reaches 3,000 + 6,000 + 6,000 + 1,500 = 16,500 at the disposal date.'),
        line('2026-03-31', 'EXPENSE', '65', 'Net book value of assets disposed of', 13500, 'debit', 'Net book value = 30,000 − 16,500 = 13,500.'),
        line('2026-03-31', 'ASSET', '28', 'Depreciation of tangible assets', 16500, 'debit', 'The accumulated depreciation attached to the van is derecognised.'),
        line('2026-03-31', 'ASSET', '24', 'Tangible assets: transport', 30000, 'credit', 'The gross amount of the van leaves the balance sheet.'),
        line('2026-03-31', 'ASSET', '51', 'Bank', 14400, 'debit', 'Proceeds including tax: 12,000 + 2,400 VAT = 14,400.'),
        line('2026-03-31', 'REVENUE', '75', 'Proceeds from disposal of fixed assets', 12000, 'credit', 'The disposal price is recognised as revenue, excluding tax.'),
        line('2026-03-31', 'LIABILITY', '44', 'Collected VAT', 2400, 'credit', 'VAT of 20% on the disposal: 12,000 × 20% = 2,400.'),
      ],
      explanation: [
        'Annual depreciation = €30,000 / 5 = €6,000, i.e. €500 per month, starting on the commissioning date of 1 July 2023.',
        'Accumulated depreciation at 31/03/2026: 2023 (6 months) €3,000 + 2024 €6,000 + 2025 €6,000 + 2026 (3 months) €1,500 = €16,500.',
        'Net book value = €30,000 − €16,500 = €13,500. Proceeds = €12,000, so the disposal produces a loss of €1,500.',
        'Because neither the net book value nor the proceeds is netted, both €13,500 of expense and €12,000 of revenue appear in the income statement.',
        'Check on the derecognition: debits 13,500 + 16,500 = 30,000 = credit 30,000. ✔',
      ],
    },
    {
      kind: 'entry',
      id: 'e04-8',
      points: 1,
      topic: 'Accrued expenses',
      prompt:
        '8) The December 2026 electricity consumption of the workshop is estimated at €3,150 excluding tax. The supplier’s invoice will be issued in January 2027. Record the adjusting entry, if necessary. (1 pt)',
      lines: [
        line('2026-12-31', 'EXPENSE', '60', 'Energy purchases', 3150, 'debit', 'The consumption relates to December 2026, so the expense belongs to the year.'),
        line('2026-12-31', 'LIABILITY', '40', 'Suppliers – Invoices not yet received', 3150, 'credit', 'An accrued expense is recorded without VAT, as no invoice has been received.'),
      ],
      explanation: [
        'Accrued expense: goods or services received before the closing date for which the invoice has not yet been received.',
        'Adjusting entries for expenses and revenues are recorded without VAT because the deduction cannot be established until the invoice arrives.',
        'The entry is reversed at the beginning of 2027, so the invoice, when it is received, is the only charge taken to 2027 expenses.',
      ],
    },
    {
      kind: 'entry',
      id: 'e04-9',
      points: 2,
      topic: 'Income tax and profit distribution',
      prompt:
        '9) The accounting profit before tax for 2026 is €142,500 and the taxable income is equal to that amount. Record the corporate income tax for 2026 and the allocation decided by the general meeting: 35% of the net income distributed to the shareholders and the remainder transferred to reserves. (2 pts)',
      lines: [
        line('2026-12-31', 'EXPENSE', '69', 'Corporate income tax', 35625, 'debit', 'Income tax = 142,500 × 25% = 35,625.'),
        line('2026-12-31', 'LIABILITY', '44', 'State – Corporate income tax', 35625, 'credit', 'The tax is a debt to the State at the closing date and is settled during 2027.'),
        line('2026-12-31', 'LIABILITY', '12', 'Profit/Loss for the year', 106875, 'debit', 'Net income to allocate = 142,500 − 35,625 = 106,875.'),
        line('2026-12-31', 'LIABILITY', '11', 'Retained earnings', 69468.75, 'credit', 'Reserves receive 65% of the result: 106,875 × 65% = 69,468.75.'),
        line('2026-12-31', 'LIABILITY', '45', 'Shareholders – Dividends payable', 37406.25, 'credit', 'Dividends: 106,875 × 35% = 37,406.25.'),
      ],
      explanation: [
        'Income tax = €142,500 × 25% = €35,625, an expense of 2026 offset by income tax payable.',
        'Net income = €142,500 − €35,625 = €106,875.',
        'Dividends = €106,875 × 35% = €37,406.25 and reserves = €106,875 × 65% = €69,468.75.',
        'The general meeting takes the decision in 2027 but the entry is booked with the 2026 accounts, so the balance sheet at 31/12/2026 already shows the allocation.',
      ],
    },
  ],
};

export const EXAM_04 = buildExam(blueprint);
