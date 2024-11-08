"use client"

import { Header } from "@/components/header";
import { Space } from "@/components/space";
import { useAuth } from "@/hooks/useAuth";
import { Auth } from "@/section/auth";
import { useEffect } from "react";

export default function Home() {

  const { authenticate } = useAuth();

  useEffect(() => {
    authenticate();
  }, [])

  return (
    <main className="auth">
      <Header />
      <Space val={"1rem"} />
      <Auth />
    </main>
  );
}
