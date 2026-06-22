"use client";
import { useState, useRef, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Save, Store, Truck, CreditCard, Sliders,
  User, Camera, Lock, Eye, EyeOff, Moon, Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const SECTION = ({ title, icon: Icon, children }: any) => (
  <section className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-800 space-y-4">
    <h2 className="text-base font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
      <Icon className="h-4 w-4 text-sage-600" />
      {title}
    </h2>
    {children}
  </section>
);

const Field = ({ label, ...props }: any) => (
  <div>
    <label className="text-xs text-stone-500 mb-1 block">{label}</label>
    <input
      {...props}
      className="w-full h-11 px-4 rounded-xl bg-cream-100 dark:bg-stone-800 outline-none focus:ring-2 ring-sage-400 text-sm dark:text-stone-100 border border-transparent focus:border-sage-300 dark:focus:border-sage-700 transition"
    />
  </div>
);

export default function AdminSettingsPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  // Store settings
  const [storeName, setStoreName] = useState("Lumière Skincare");
  const [storeEmail, setStoreEmail] = useState("hello@lumiere.com");
  const [currency, setCurrency] = useState("USD");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(75);
  const [defaultShippingFee, setDefaultShippingFee] = useState(8);
  const [enableCod, setEnableCod] = useState(true);
  const [enableOnline, setEnableOnline] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Profile
  const [adminName, setAdminName] = useState(session?.user?.name || "");
  const [adminPhone, setAdminPhone] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(session?.user?.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_settings");
      if (saved) {
        const p = JSON.parse(saved);
        if (p.storeName) setStoreName(p.storeName);
        if (p.storeEmail) setStoreEmail(p.storeEmail);
        if (p.currency) setCurrency(p.currency);
        if (p.freeShippingThreshold !== undefined) setFreeShippingThreshold(Number(p.freeShippingThreshold));
        if (p.defaultShippingFee !== undefined) setDefaultShippingFee(Number(p.defaultShippingFee));
        if (p.enableCod !== undefined) setEnableCod(Boolean(p.enableCod));
        if (p.enableOnline !== undefined) setEnableOnline(Boolean(p.enableOnline));
        if (p.lowStockThreshold !== undefined) setLowStockThreshold(Number(p.lowStockThreshold));
      }
    } catch {}
    if (session?.user) {
      setAdminName(session.user.name || "");
      setImagePreview(session.user.image || null);
    }
  }, [session]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveStoreSettings = () => {
    const settings = { storeName, storeEmail, currency, freeShippingThreshold, defaultShippingFee, enableCod, enableOnline, lowStockThreshold };
    localStorage.setItem("admin_settings", JSON.stringify(settings));
    window.dispatchEvent(new Event("storage"));
    toast.success("Store settings saved!");
  };

  const saveProfile = () => {
    startTransition(async () => {
      try {
        let imageUrl = imagePreview;
        // Upload image if a new one was selected (send as base64 JSON)
        if (imageFile && imagePreview?.startsWith("data:")) {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: imagePreview, folder: "lumiere/avatars" }),
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          imageUrl = data.url;
        }

        const res = await fetch("/api/register", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: adminName, phone: adminPhone, image: imageUrl }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        await update({ name: adminName, image: imageUrl });
        toast.success("Profile updated successfully!");
      } catch (err: any) {
        toast.error(err.message || "Failed to update profile");
      }
    });
  };

  const savePassword = () => {
    if (!currentPw || !newPw || !confirmPw) return toast.error("All password fields are required");
    if (newPw !== confirmPw) return toast.error("New passwords do not match");
    if (newPw.length < 8) return toast.error("Password must be at least 8 characters");

    startTransition(async () => {
      const res = await fetch("/api/register", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
        toast.success("Password changed successfully!");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100">Settings</h1>

      {/* ── ADMIN PROFILE ── */}
      <SECTION title="Admin Profile" icon={User}>
        <div className="flex items-start gap-6 flex-wrap">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-24 w-24">
              <div className="h-24 w-24 rounded-2xl bg-sage-100 dark:bg-sage-950/40 overflow-hidden grid place-items-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-sage-600">
                    {adminName?.[0]?.toUpperCase() || "A"}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-sage-600 text-white grid place-items-center shadow-lg hover:bg-sage-700 transition"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </div>
            <p className="text-xs text-stone-400">Click to change photo</p>
          </div>

          {/* Fields */}
          <div className="flex-1 min-w-[200px] space-y-3">
            <Field label="Full Name" value={adminName} onChange={(e: any) => setAdminName(e.target.value)} />
            <Field label="Email (read-only)" value={session?.user?.email || ""} readOnly className="opacity-60 cursor-not-allowed" />
            <Field label="Phone Number" type="tel" value={adminPhone} onChange={(e: any) => setAdminPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
          </div>
        </div>
        <Button onClick={saveProfile} disabled={pending} className="gap-2 mt-2">
          <Save className="h-4 w-4" /> Save Profile
        </Button>
      </SECTION>

      {/* ── CHANGE PASSWORD ── */}
      <SECTION title="Change Password" icon={Lock}>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="relative">
            <Field label="Current Password" type={showPw ? "text" : "password"} value={currentPw} onChange={(e: any) => setCurrentPw(e.target.value)} />
          </div>
          <Field label="New Password" type={showPw ? "text" : "password"} value={newPw} onChange={(e: any) => setNewPw(e.target.value)} />
          <Field label="Confirm New Password" type={showPw ? "text" : "password"} value={confirmPw} onChange={(e: any) => setConfirmPw(e.target.value)} />
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-600 transition"
          >
            {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPw ? "Hide" : "Show"} passwords
          </button>
          <Button onClick={savePassword} disabled={pending} variant="outline" className="gap-2">
            <Lock className="h-4 w-4" /> Update Password
          </Button>
        </div>
      </SECTION>

      {/* ── APPEARANCE ── */}
      <SECTION title="Appearance" icon={Sun}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Dark Mode</p>
            <p className="text-xs text-stone-400 mt-0.5">Toggle between light and dark admin interface</p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              theme === "dark" ? "bg-sage-600" : "bg-stone-200 dark:bg-stone-700"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                theme === "dark" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </SECTION>

      {/* ── STORE INFO ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <SECTION title="General Store Info" icon={Store}>
          <Field label="Store Name" value={storeName} onChange={(e: any) => setStoreName(e.target.value)} />
          <Field label="Support Email" type="email" value={storeEmail} onChange={(e: any) => setStoreEmail(e.target.value)} />
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Base Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-cream-100 dark:bg-stone-800 outline-none focus:ring-2 ring-sage-400 text-sm dark:text-stone-100"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </SECTION>

        <SECTION title="Shipping &amp; Delivery" icon={Truck}>
          <Field label="Free Shipping Threshold ($)" type="number" value={freeShippingThreshold} onChange={(e: any) => setFreeShippingThreshold(Number(e.target.value))} />
          <Field label="Standard Shipping Fee ($)" type="number" value={defaultShippingFee} onChange={(e: any) => setDefaultShippingFee(Number(e.target.value))} />
        </SECTION>

        <SECTION title="Payment Gateways" icon={CreditCard}>
          {[
            { key: "cod", label: "Cash on Delivery", desc: "Allow customers to pay on receipt", val: enableCod, set: setEnableCod },
            { key: "online", label: "Online Payments", desc: "Accept card/Razorpay payments", val: enableOnline, set: setEnableOnline },
          ].map(({ key, label, desc, val, set }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{label}</p>
                <p className="text-xs text-stone-400">{desc}</p>
              </div>
              <button
                onClick={() => set(!val)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${val ? "bg-sage-600" : "bg-stone-200 dark:bg-stone-700"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${val ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </SECTION>

        <SECTION title="Inventory Defaults" icon={Sliders}>
          <Field label="Low Stock Warning Threshold" type="number" value={lowStockThreshold} onChange={(e: any) => setLowStockThreshold(Number(e.target.value))} />
          <p className="text-xs text-stone-400">
            Products below this stock level will show a warning badge in the dashboard.
          </p>
        </SECTION>
      </div>

      {/* Save Store Settings */}
      <div className="flex justify-end">
        <Button onClick={saveStoreSettings} className="gap-2 px-8">
          <Save className="h-4 w-4" /> Save Store Settings
        </Button>
      </div>
    </div>
  );
}
