"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/login`,
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      console.log(data, "data");
      if (data.loginFirstTime) {
        router.push("/authentication/reset-password"); // Redirect to password reset page
      } else {
        router.push("/dashboard"); // Redirect to dashboard if not first login
      }
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="bg-slate-100 h-screen w-screen relative flex justify-center items-center">
      <div className="relative grid h-5/6 w-9/12 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 shadow-lg ">
        {/* Gradient Background */}
        <div className="hidden md:block bg-gradient-to-br from-pink-300 via-purple-300 to-blue-400 rounded-l-lg" />

        {/* Login Form */}
        <div className="flex items-center bg-white justify-center p-8 rounded-r-lg ">
          <div className="mx-auto w-full max-w-md space-y-16">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Welcome Back </h1>
              <p className="text-gray-500">Please log in to continue</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="jdoe"
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    required
                    type={showPassword ? "text" : "password"}
                    className="w-full pr-10"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  It must be a combination of minimum 6 uppercase and lowercase
                  letters, numbers, and special characters #, $, %, &
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* <Checkbox id="remember" /> */}
                  {/* <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label> */}
                </div>
                <Link
                  href="/authentication/reset-password"
                  className="text-sm font-bold text-blue-600 hover:text-blue-500"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full font-bold bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC]  hover:bg-blue-500"
              >
                Log In
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
