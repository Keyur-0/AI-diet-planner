export default function FormSelect({
  label,
  id,
  name,
  value,
  onChange,
  required = false,
  error,
  options = [],
  placeholder = "Select an option",
  helper
}) {
  return (
    <div className="w-full space-y-1.5 text-left">
      <label htmlFor={id || name} className="block text-xs font-bold uppercase tracking-wider text-slate-300">
        {label} {required && <span className="text-emerald-400">*</span>}
      </label>

      <div className="relative">
        <select
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-slate-100 text-sm focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
            error
              ? 'border-rose-500/80 focus:ring-rose-500/30 focus:border-rose-500'
              : 'border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20'
          }`}
        >
          <option value="" disabled className="bg-slate-900 text-slate-500">
            {placeholder}
          </option>
          {options.map((opt) => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optValue} value={optValue} className="bg-slate-900 text-slate-200">
                {optLabel}
              </option>
            );
          })}
        </select>

        {/* Custom Chevron Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
          <span>⚠️</span> {error}
        </p>
      ) : helper ? (
        <p className="text-[11px] text-slate-400 mt-1">{helper}</p>
      ) : null}
    </div>
  );
}
