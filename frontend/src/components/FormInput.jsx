export default function FormInput({
  label,
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  error,
  helper,
  unit,
  min,
  max,
  step
}) {
  return (
    <div className="w-full space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label htmlFor={id || name} className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-emerald-400">*</span>}
        </label>
        {unit && (
          <span className="text-[11px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
            {unit}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-rose-500/80 focus:ring-rose-500/30 focus:border-rose-500'
              : 'border-slate-750 border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20'
          }`}
        />
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
