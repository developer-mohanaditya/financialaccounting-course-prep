import { useMemo, useState } from 'react';
import {
  BALANCE_SHEET_CHART,
  PROFIT_AND_LOSS_CHART,
  type ChartGroup,
} from '../data/chartOfAccounts';
import { normaliseText } from '../lib/format';

/**
 * The handout's detachable annex: account number and the exact wording to use.
 * Part Two lines are marked on the number and the wording printed here, so the
 * annex travels with the paper.
 */
export function ChartOfAccountsAnnex({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState('');

  const balanceSheet = useMemo(() => filterGroups(BALANCE_SHEET_CHART, query), [query]);
  const profitAndLoss = useMemo(() => filterGroups(PROFIT_AND_LOSS_CHART, query), [query]);
  const found = balanceSheet.length > 0 || profitAndLoss.length > 0;

  return (
    <div className={`annex${compact ? ' annex-compact' : ''}`}>
      <div className="row gap-sm wrap annex-tools" style={{ justifyContent: 'space-between' }}>
        <input
          type="text"
          value={query}
          autoComplete="off"
          aria-label="Find an account in the chart of accounts"
          placeholder="Find an account (e.g. 62, rent, VAT)"
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="tiny muted">
          Annex wording — every line is marked on the account number and this exact wording.
        </span>
      </div>

      {!found ? (
        <p className="tiny muted" style={{ marginBottom: 0 }}>
          No account in the annex matches “{query.trim()}”. Clear the search box to see the full chart.
        </p>
      ) : (
        <div className="annex-grid">
          <div>
            <div className="annex-title">Chart of accounts — balance sheet</div>
            {balanceSheet.map((group) => (
              <AnnexGroup group={group} key={`bs-${group.heading}`} />
            ))}
          </div>
          <div>
            <div className="annex-title">Chart of accounts — profit and loss account</div>
            {profitAndLoss.map((group) => (
              <AnnexGroup group={group} key={`pl-${group.heading}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AnnexGroup({ group }: { group: ChartGroup }) {
  return (
    <div className="annex-group">
      <div className="annex-group-heading">{group.heading}</div>
      <ul className="annex-list">
        {group.entries.map((entry, index) => (
          <li key={`${entry.number}-${entry.wording}-${index}`}>
            <span className="annex-no">{entry.number}</span>
            <span>{entry.wording}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Filter by account number prefix or by any word of the wording. */
function filterGroups(groups: ChartGroup[], query: string): ChartGroup[] {
  const text = normaliseText(query);
  const digits = query.replace(/[^0-9]/g, '');
  if (!text && !digits) return groups;

  return groups
    .map((group) => ({
      heading: group.heading,
      entries: group.entries.filter(
        (entry) =>
          (digits !== '' && entry.number.replace(/[^0-9]/g, '').startsWith(digits)) ||
          (text !== '' && normaliseText(entry.wording).includes(text)),
      ),
    }))
    .filter((group) => group.entries.length > 0);
}
