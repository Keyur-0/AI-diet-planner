export default function Button({
  children,
  type = "button",
  onClick,
  isLoading = false,
  loadingText = "Processing...",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base tracking-wide"
  };

  const variantStyles = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 focus:ring-emerald-400 active:scale-[0.98]",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 focus:ring-slate-400 active:scale-[0.98]",
    outline: "border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 focus:ring-emerald-400 active:scale-[0.98]"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
