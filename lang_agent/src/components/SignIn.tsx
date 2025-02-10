import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export default function SignIn() {
  //will return the children below signed in If u are only signed in
  return (
    <SignedIn>
      <Link href="/dashboard">
        <button className="group-relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 hover-:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 rounded-3xl">
          Get Started
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"/>
        </button>
      </Link>
    </SignedIn>
  );
}
