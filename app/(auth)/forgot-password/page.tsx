"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/auth/AuthFields";
import { requestPasswordReset } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await requestPasswordReset(email);
      if (res.success) { setSent(true); toast.success(res.success); }
    });
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl mb-2">Reset Password</h1>
      <p className="text-stone-500 text-sm mb-8">Enter your email to receive a reset link</p>
      {sent ? (
        <div className="bg-sage-50 rounded-xl p-6 text-center">
          <p className="text-sage-700">✓ Check your inbox for a reset link.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={pending}>{pending ? "Sending..." : "Send Reset Link"}</Button>
        </form>
      )}
      <p className="text-center text-sm text-stone-500 mt-6"><Link href="/login" className="text-sage-600 hover:underline">Back to login</Link></p>
    </div>
  );
}
