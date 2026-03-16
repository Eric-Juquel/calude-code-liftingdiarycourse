"use client";

import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function HeaderNav() {
  return (
    <div className="flex items-center gap-3">
      <Show when="signed-out" fallback={<UserButton />}>
        <SignInButton mode="modal">
          <Button variant="outline" className="rounded-full border-gray-500 bg-transparent text-gray-200 hover:bg-transparent hover:border-gray-300 hover:text-white">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 active:scale-95">
            Sign Up
          </Button>
        </SignUpButton>
      </Show>
    </div>
  );
}
