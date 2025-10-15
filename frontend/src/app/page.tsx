"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const user = await getCurrentUser();
      if (user) router.replace("/rooms");
      else router.replace("/login");
    }
    checkUser();
  }, [router]);


  return (
    <div className="p-8 text-center">
      Redirecting...
    </div>
  );
}
