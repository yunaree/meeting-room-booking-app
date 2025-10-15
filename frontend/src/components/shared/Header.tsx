"use client";

import { GalleryVerticalEnd, UserIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/api";

export default function Header() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    fetchUser();
  }, []);

  return (
    <div className="flex justify-between items-center my-6 px-4">
      {/* Центрований заголовок */}
      <a href="#" className="flex items-center gap-2 font-medium mx-auto absolute left-1/2 -translate-x-1/2">
        <div className="bg-primary text-primary-foreground flex w-6 h-6 items-center justify-center rounded-md">
          <GalleryVerticalEnd className="w-4 h-4" />
        </div>
        Meeting Room Booking App.
      </a>

      {user && (
        <span className="ml-360 font-medium border px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">
            <UserIcon className="inline-block w-4 mr-2" />
          {user.name}
        </span>
      )}
    </div>
  );
}
