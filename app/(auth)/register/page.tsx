"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Field, Divider } from "@/components/auth/AuthFields";
import { registerSchema } from "@/lib/validations";
import { registerUser } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = (data: any) => startTransition(async () => {
    const res = await registerUser(data);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Account created!");
    await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    router.push("/");
    router.refresh();
  });

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl mb-2">Create Account</h1>
      <p className="text-stone-500 text-sm mb-8">Begin your skincare journey</p>
      <GoogleButton />
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full Name" {...register("name")} error={errors.name} />
        <Field label="Email" type="email" {...register("email")} error={errors.email} />
        <div className="relative">
          <Field label="Password" type={show ? "text" : "password"} {...register("password")} error={errors.password} />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-8 text-stone-400">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Creating..." : "Create Account"}</Button>
      </form>
      <p className="text-center text-sm text-stone-500 mt-6">Have an account? <Link href="/login" className="text-sage-600 font-medium hover:underline">Log in</Link></p>
    </div>
  );
}
