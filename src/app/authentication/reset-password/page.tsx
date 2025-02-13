import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ResetPasswordPage() {
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

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" required type="text" className="w-full" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Old password</Label>
                <Input
                  id="new-password"
                  required
                  type="password"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  required
                  type="password"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  required
                  type="password"
                  className="w-full"
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
