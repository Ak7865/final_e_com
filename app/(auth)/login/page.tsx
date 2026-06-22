"use client";
import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { GoogleButton } from "../../../components/auth/GoogleButton";
import { loginSchema } from "../../../lib/validations";
import { Divider, Field } from "@/components/auth/AuthFields";

function LoginForm() {
  const router = useRouter();
  const callbackUrl = useSearchParams().get("callbackUrl") || "/";
  const errorParam = useSearchParams().get("error");
  const authError = useSearchParams().get("error");
  const [pending, startTransition] = useTransition();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });


  const onSubmit = (data: any) => startTransition(async () => {
    const res: any = await signIn("credentials", { ...data, redirect: false });
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }

    // Retrieve the session to verify the user role
    const session = await getSession();
    toast.success("Welcome back!");

    let target = callbackUrl;

    // If the callbackUrl is an absolute URL, convert it to a relative path if it matches our origin
    if (target.startsWith("http://") || target.startsWith("https://")) {
      try {
        const urlObj = new URL(target);
        if (urlObj.origin === window.location.origin) {
          target = urlObj.pathname + urlObj.search;
        } else {
          // External redirects should use window.location.href
          window.location.href = target;
          return;
        }
      } catch (e) {
        console.error("Invalid callback URL:", e);
      }
    }

    // Force redirect to admin dashboard if logging in as admin to the home page
    if (session?.user?.role === "admin" && target === "/") {
      target = "/admin/dashboard";
    }

    window.location.href = target;
  });

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl mb-2">Welcome Back</h1>
      <p className="text-stone-500 text-sm mb-8">Log in to your Lumière account</p>
      {authError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {authError === "Configuration"
            ? "Sign-in is misconfigured on the server. Check AUTH_SECRET, Google OAuth keys, and MONGODB_URI in Vercel env vars, then redeploy."
            : authError === "AccessDenied"
              ? "Sign-in was denied. Please try again or use email/password."
              : "Sign-in failed. Please try again."}
        </div>
      )}
      <GoogleButton callbackUrl={callbackUrl} />
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="email">
        <Field label="Email" type="email" {...register("email")} error={errors.email} />
        <div className="relative">
          <Field label="Password" type={show ? "text" : "password"} {...register("password")} error={errors.password} />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-8 text-stone-400">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
        <div className="flex justify-end"><Link href="/forgot-password" className="text-xs text-sage-600 hover:underline">Forgot password?</Link></div>
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Logging in..." : "Log In"}</Button>
      </form>
      <p className="text-center text-sm text-stone-500 mt-6">No account? <Link href="/register" className="text-sage-600 font-medium hover:underline">Sign up</Link></p>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
