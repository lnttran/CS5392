"use client";

import { useEffect, useState } from "react";
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
import { Title } from "@/types/title";
import { fetchWithAuth } from "@/lib/fetch";

const formSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  level: z.string().min(1, "User level is required"),
  titleId: z.string().min(1, "User title is required"),
});

export function Signup({
  token,
  onUserCreated,
}: {
  token: string;
  onUserCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [titles, setTitles] = useState<Title[]>([]);
  // const [token, setToken] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      level: "",
      titleId: "",
    },
  });

  // useEffect(() => {
  //   if (open) {
  //     const storedToken = localStorage.getItem("token");
  //     console.log(storedToken, "token");
  //     if (!storedToken) {
  //       window.location.href = "/authentication";
  //     } else {
  //       setToken(storedToken);
  //     }
  //   }
  // }, [open]);

  useEffect(() => {
    if (open && token) {
      fetchTitles();
    }
  }, [token, open]);

  const fetchTitles = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/titles`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data, "titles");
        setTitles(data);
      } else {
        toast.error("Failed to fetch titles");
      }
    } catch (error) {
      toast.error("Failed to fetch titles");
    }
  };

  async function generateUniqueUsername(firstName: string, lastName: string) {
    let username = (firstName[0] + lastName).toLowerCase();
    let isUnique = false;
    let attempt = 0;

    while (!isUnique) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/check-username/${username}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();

      if (!data) {
        isUnique = true;
      } else {
        attempt++;
        const randomNumber = Math.floor(10 + Math.random() * 90);
        username = `${firstName[0]}${lastName}${randomNumber}`.toLowerCase();
      }

      if (attempt > 10) break;
    }

    return username;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const username = await generateUniqueUsername(
      values.firstname,
      values.lastname
    );
    const password = username;

    const userData = {
      username,
      titleId: values.titleId, // Ensure the field names match your backend
      firstname: values.firstname,
      lastname: values.lastname,
      level: values.level.toString(), // Backend expects a string to be parsed into int
      email: values.email,
      password,
    };

    console.log(userData, "userData");

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`,
        {
          method: "POST",
          body: JSON.stringify(userData),
        }
      );

      if (response.ok) {
        // console.log("User created successfully:", data);

        // const emailResponse = await fetch("/api/auth/send", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     username: userData.username,
        //     password: userData.password,
        //     email: userData.email,
        //   }),
        // });

        // const emailData = await emailResponse.json();

        // if (!emailResponse.ok) {
        //   console.error("Error sending email:", emailData.error);
        // } else {
        //   console.log("Email sent successfully:", emailData);
        //   toast("Account registered successfully", {
        //     description: (
        //       <div className="text-gray-600">
        //         Please check the registered email for log in information
        //       </div>
        //     ),
        //   });
        // }
        //add toast to inform user that account has been created
        toast("Account registered successfully", {
          description: (
            <div className="text-gray-600">
              Please check the registered email for log in information
            </div>
          ),
        });
        setOpen(false);
        form.reset();
        onUserCreated();
      } else {
        toast("Fail to register account");
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
                name="firstname"
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
                name="lastname"
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
                  <FormLabel>Level</FormLabel>
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
                      <SelectItem value="0">Level 0</SelectItem>
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                      <SelectItem value="4">Level 4</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="titleId"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={titles.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user title" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {titles.map((title) => (
                          <SelectItem
                            key={title.title_id}
                            value={String(title.title_id)}
                          >
                            {title.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
