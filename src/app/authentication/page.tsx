import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
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

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Username</Label>
                <Input
                  id="username"
                  placeholder="jdoe"
                  required
                  type="text"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  required
                  type="password"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  It must be a combination of minimum 8 uppercase and lowercase
                  letters, numbers, and symbols
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
