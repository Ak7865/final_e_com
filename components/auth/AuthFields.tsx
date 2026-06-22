export const Field = ({ label, error, ...props }: any) => (
  <div>
    <label className="text-sm text-stone-600 mb-1 block">{label}</label>
    <input {...props} className="w-full h-11 px-4 rounded-xl bg-white border border-stone-200 outline-none focus:ring-2 ring-sage-400 text-sm" />
    {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
  </div>
);

export const Divider = () => (
  <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-stone-200" /><span className="text-xs text-stone-400">OR</span><div className="flex-1 h-px bg-stone-200" /></div>
);
