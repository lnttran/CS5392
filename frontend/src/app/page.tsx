"use client"; // Add this line

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/authentication"); // Redirect to authentication if no token
    } else {
      router.push("/dashboard"); // Redirect to dashboard if token exists
    }
  }, [router]);

  return null; // Render nothing while redirecting
}
