"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema as any) as any,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginFormData) {
    if (data.password !== "password") {
      setError("root", {
        message: "Invalid email or password.",
      });
      return;
    }

    router.push("/");
  }

  return (
    <Card className="border-border/70 shadow-lg">
      <CardHeader className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-sm">
          <Image
            src="/acf-logo-dark.avif"
            alt="Avrio Clean Fund"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Avrio Clean Fund
          </p>
          <CardTitle className="text-2xl">Sign in to the platform</CardTitle>
          <CardDescription>
            Use your work email to access borrowers, deals, and relationship workflows.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {errors.root?.message && (
            <Alert variant="destructive">
              <LockKeyhole className="h-4 w-4" />
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@avriocleanfund.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Need an account?{" "}
            <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
              Create one
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
