export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream-50">
      <div className="hidden lg:flex flex-col justify-between bg-sage-700 text-cream-100 p-12">
        <span className="font-serif text-3xl">Lumière</span>
        <div>
          <h2 className="font-serif text-4xl leading-tight">Glow with<br /><span className="italic">Nature's Best</span></h2>
          <p className="text-cream-100/70 mt-4 max-w-sm">Join thousands discovering radiant skin with clean botanical skincare.</p>
        </div>
        <p className="text-cream-100/50 text-sm">© {new Date().getFullYear()} Lumière</p>
      </div>
      <div className="flex items-center justify-center p-6">{children}</div>
    </div>
  );
}