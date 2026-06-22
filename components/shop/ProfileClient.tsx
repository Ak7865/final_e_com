"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Plus, Trash2, MapPin, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema } from "@/lib/validations";
import { updateProfile, addAddress, deleteAddress } from "@/actions/profile";

export function ProfileClient({ user }: { user: any }) {
  const [tab, setTab] = useState<"profile" | "addresses">("profile");
  const [image, setImage] = useState(user.image);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [addresses, setAddresses] = useState(user.addresses || []);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch("/api/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: reader.result, folder: "lumiere/avatars" }),
      });
      const data = await res.json();
      setImage(data.url);
      await updateProfile({ image: data.url, imagePublicId: data.publicId });
      toast.success("Photo updated");
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => startTransition(async () => {
    await updateProfile({ name, phone });
    toast.success("Profile saved");
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(addressSchema) });
  const onAddAddress = (data: any) => startTransition(async () => {
    const res = await addAddress(data);
    if (res.success) { setAddresses(res.addresses); setShowAddrForm(false); reset(); toast.success("Address added"); }
  });

  const removeAddr = (id: string) => startTransition(async () => {
    await deleteAddress(id);
    setAddresses((p: any[]) => p.filter((a) => a._id !== id));
    toast.success("Address removed");
  });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">My Account</h1>
      <div className="flex gap-2 mb-8 border-b border-stone-100">
        {[["profile", "Profile", UserIcon], ["addresses", "Addresses", MapPin]].map(([key, label, Icon]: any) => (
          <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-3 border-b-2 -mb-px text-sm font-medium ${tab === key ? "border-sage-600 text-sage-600" : "border-transparent text-stone-500"}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 shadow-sm max-w-lg">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <Image src={image || "/avatar-placeholder.png"} alt="avatar" width={80} height={80} className="rounded-full h-20 w-20 object-cover border-2 border-sage-100" />
              <label className="absolute bottom-0 right-0 bg-sage-600 text-white rounded-full p-1.5 cursor-pointer">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" hidden onChange={handleAvatar} />
              </label>
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-stone-500">{user.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div><label className="text-sm text-stone-500 mb-1 block">Full Name</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-cream-100 dark:bg-stone-800 outline-none text-sm" /></div>
            <div><label className="text-sm text-stone-500 mb-1 block">Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-cream-100 dark:bg-stone-800 outline-none text-sm" /></div>
            <Button onClick={saveProfile} disabled={pending}>{pending ? "Saving..." : "Save Changes"}</Button>
          </div>
        </div>
      )}

      {tab === "addresses" && (
        <div className="space-y-4">
          {addresses.map((a: any) => (
            <div key={a._id} className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm flex justify-between">
              <div>
                <p className="font-medium">{a.fullName} {a.isDefault && <span className="text-xs bg-sage-50 text-sage-600 px-2 py-0.5 rounded-full ml-2">Default</span>}</p>
                <p className="text-sm text-stone-500">{a.line1}, {a.city}, {a.state} {a.postalCode}</p>
                <p className="text-sm text-stone-400">{a.phone}</p>
              </div>
              <button onClick={() => removeAddr(a._id)} className="text-red-500 self-start"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {!showAddrForm ? (
            <Button variant="outline" onClick={() => setShowAddrForm(true)}><Plus className="h-4 w-4" /> Add Address</Button>
          ) : (
            <form onSubmit={handleSubmit(onAddAddress)} className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm grid sm:grid-cols-2 gap-4">
              <AddrField label="Full Name" {...register("fullName")} error={errors.fullName} />
              <AddrField label="Phone" {...register("phone")} error={errors.phone} />
              <AddrField label="Address Line 1" className="sm:col-span-2" {...register("line1")} error={errors.line1} />
              <AddrField label="City" {...register("city")} error={errors.city} />
              <AddrField label="State" {...register("state")} error={errors.state} />
              <AddrField label="Postal Code" {...register("postalCode")} error={errors.postalCode} />
              <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" {...register("isDefault")} /> Set as default</label>
              <div className="sm:col-span-2 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddrForm(false)}>Cancel</Button>
                <Button type="submit" disabled={pending}>Save Address</Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

const AddrField = ({ label, error, className, ...props }: any) => (
  <div className={className}>
    <label className="text-xs text-stone-500 mb-1 block">{label}</label>
    <input {...props} className="w-full h-11 px-4 rounded-xl bg-cream-100 dark:bg-stone-800 outline-none text-sm" />
    {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
  </div>
);