"use client";

import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

export function HeaderNav() {
  return (
    <div className="flex items-center gap-3">
      <Show when="signed-out" fallback={<UserButton />}>
        <SignInButton mode="modal">
          <button className="px-5 py-2 rounded-full border border-gray-500 text-sm font-medium text-gray-200 hover:border-gray-300 hover:text-white transition-all duration-200 cursor-pointer">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="px-5 py-2 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-sm font-medium text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all duration-200 cursor-pointer">
            Sign Up
          </button>
        </SignUpButton>
      </Show>
    </div>
  );
}
