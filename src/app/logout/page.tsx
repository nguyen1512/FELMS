"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    document.cookie = "token=; Max-Age=0; path=/";
    document.cookie = "user=; Max-Age=0; path=/";

    window.location.replace("/login");
  }, []);

  return null;
}