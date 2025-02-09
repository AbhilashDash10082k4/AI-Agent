import { SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

export default function SignOut() {
  return (
  <SignedOut>
    <SignInButton mode="modal" fallbackRedirectUrl={"/dashboard"}
    forceRedirectUrl={"/dashboard"}
    >
        <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-full hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Sign Up
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:-translate-x-0.5"/>
            <div className="absolute inset--0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/220 blur-xl opacity group-hover:opacity-100 transition-opacity"/>
        </button>
    </SignInButton>
  </SignedOut>
  );
}
