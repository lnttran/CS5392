"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const passwordValidationRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!form.newPassword.match(passwordValidationRegex)) {
    //   setError(
    //     "Password must be at least 8 characters long, containing uppercase, lowercase letters, numbers, and symbols."
    //   );
    //   return;
    // }

    // if (form.oldPassword !== form.confirmPassword) {
    //   setError("Passwords do not match.");
    //   return;
    // }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess(data.message);
      setError(null);

      setTimeout(() => {
        router.push("/authentication");
      }, 2000);
    } else {
      setError(data.error);
      setSuccess(null);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-2xl h-full">
        <CardContent className="pt-6 px-6 my-10">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Change new password
              </h1>
              <p className="text-sm text-gray-500 px-6">
                Password should be at least 6 characters long and should contain
                at least one uppercase alphabet, at least one lowercase
                alphabet, at least one numeral at least one of the special
                characters - #,$,%,&
              </p>
            </div>

            {error && (
              <p className="text-red-500 text-center font-bold text-md">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-500 text-center font-bold text-md">
                {success}
              </p>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  required
                  type="text"
                  className="w-full"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Old password</Label>
                <Input
                  id="old-password"
                  required
                  type="password"
                  className="w-full"
                  value={form.oldPassword}
                  onChange={(e) =>
                    setForm({ ...form, oldPassword: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  required
                  type="password"
                  className="w-full"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  required
                  type="password"
                  className="w-full"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-end">
                <Link
                  href="/authentication"
                  className="text-sm font-bold text-blue-600 hover:text-blue-500"
                >
                  Log in?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full font-bold bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC] hover:bg-blue-500"
              >
                Reset Password
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
