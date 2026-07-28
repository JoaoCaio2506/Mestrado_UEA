import { MONTH_NAMES } from './dateFilter';

export default function DateFilterBar({ day, month, year, years, onChange, onClear }) {
  const hasFilter = day || month || year;
  return (
    <div className="shell-filter-bar">
      <div className="shell-filter-field">
        <label>Dia</label>
        <select value={day} onChange={(e) => onChange({ day: e.target.value })}>
          <option value="">Todos</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div className="shell-filter-field">
        <label>Mês</label>
        <select value={month} onChange={(e) => onChange({ month: e.target.value })}>
          <option value="">Todos</option>
          {MONTH_NAMES.map((name, i) => (
            <option key={name} value={i + 1}>{name}</option>
          ))}
        </select>
      </div>
      <div className="shell-filter-field">
        <label>Ano</label>
        <select value={year} onChange={(e) => onChange({ year: e.target.value })}>
          <option value="">Todos</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      {hasFilter && (
        <button type="button" className="shell-filter-clear" onClick={onClear}>
          <i className="ti ti-x" /> Limpar filtros
        </button>
      )}
    </div>
  );
}
