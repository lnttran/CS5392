"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

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

  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const passwordValidationRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#\$%&])[A-Za-z\d#\$%&]{6,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.newPassword.match(passwordValidationRegex)) {
      setError(
        "Password must be at least 6 characters long, containing uppercase, lowercase letters, numbers, and symbols - #,$,%,&."
      );
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    console.log(form, "form");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/reset-password`,
      {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({
          password: form.newPassword,
          username: form.username,
          currentPassword: form.oldPassword,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.text();
    console.log(data, "data");

    if (res.ok) {
      setSuccess(data);
      setError(null);

      setTimeout(() => {
        router.push("/authentication");
      }, 200);
    } else {
      setError(data);
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
              {(["oldPassword", "newPassword", "confirmPassword"] as const).map(
                (field) => (
                  <div key={field} className="space-y-2 relative">
                    <Label htmlFor={field}>
                      {field === "oldPassword"
                        ? "Old Password"
                        : field === "newPassword"
                          ? "New Password"
                          : "Confirm Password"}
                    </Label>
                    <div className="relative">
                      <Input
                        id={field}
                        required
                        type={showPassword[field] ? "text" : "password"}
                        className="w-full pr-10"
                        value={form[field]}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [field]: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            [field]: !prev[field],
                          }))
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword[field] ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                )
              )}

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
