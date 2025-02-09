"use client";

import Header from "@/components/Header";
import { Authenticated } from "convex/react";
export function DashboardLayout({children} : {children: React.ReactNode}) {
  //Authenticate from convex/react - ensure the children inside this component are accessible only when the user is authenticated
  return (
    <div>
      <Authenticated>
        <h1>Sidebar</h1>
      </Authenticated>
      <main>
        <Header/>
        {children}
      </main>
    </div>
  );
}
