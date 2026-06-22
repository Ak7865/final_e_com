"use client";
import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/auth/AuthFields";
import { resetPassword } from "@/actions/auth";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [pending, startTransition] = useTransition();
  const [pw, setPw] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Min 8 characters");
    startTransition(async () => {
      const res = await resetPassword(token, pw);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(res.success!);
      router.push("/login");
    });
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl mb-2">New Password</h1>
      <p className="text-stone-500 text-sm mb-8">Enter your new password</p>
      <form onSubmit={submit} className="space-y-4">
        <Field label="New Password" type="password" value={pw} onChange={(e: any) => setPw(e.target.value)} required />
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Updating..." : "Update Password"}</Button>
      </form>
    </div>
  );
}
export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
