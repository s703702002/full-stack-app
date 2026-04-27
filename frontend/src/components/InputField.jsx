export default function InputField({ label, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-600 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
      />
    </div>
  );
}
