"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  level: z.string().min(1, "User level is required"),
});

export function Signup() {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      level: "",
    },
  });

  async function generateUniqueUsername(firstName: string, lastName: string) {
    let username = (firstName[0] + lastName).toLowerCase();
    let isUnique = false;
    let attempt = 0;

    while (!isUnique) {
      const response = await fetch(
        `/api/user/check-username?username=${username}`
      );
      const data = await response.json();

      if (!data.exists) {
        isUnique = true;
      } else {
        attempt++;
        const randomNumber = Math.floor(10 + Math.random() * 90);
        username = `${firstName[0]}${lastName}${randomNumber}`.toLowerCase();
      }

      if (attempt > 5) break;
    }

    return username;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const username = await generateUniqueUsername(
      values.firstName,
      values.lastName
    );
    const password = username;

    const userData = {
      username,
      ...values,
      password,
    };

    console.log(userData, "userDAta");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // console.log("User created successfully:", data);

        const emailResponse = await fetch("/api/auth/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: userData.username,
            password: userData.password,
            email: userData.email,
          }),
        });

        const emailData = await emailResponse.json();

        if (!emailResponse.ok) {
          console.error("Error sending email:", emailData.error);
        } else {
          console.log("Email sent successfully:", emailData);
          toast("Account registered successfully", {
            description: (
              <div className="text-gray-600">
                Please check the registered email for log in information
              </div>
            ),
          });
        }

        setOpen(false);
        form.reset();
        window.location.reload();
      } else {
        console.error("Error creating user:", data.error);
        toast("Fail to register account", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC]  hover:bg-blue-500">
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="w-screen">
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
          <DialogDescription>
            Filling out information for new user
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of User</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ZERO">Level 0</SelectItem>
                      <SelectItem value="ONE">Level 1</SelectItem>
                      <SelectItem value="TWO">Level 2</SelectItem>
                      <SelectItem value="THREE">Level 3</SelectItem>
                      <SelectItem value="ROOT">Root</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full font-bold bg-gradient-to-r from-[#5CADF8] from-0% via-[#5F5DF9] via-63% to-[#9B8BFC]  hover:bg-blue-500"
            >
              Done
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
