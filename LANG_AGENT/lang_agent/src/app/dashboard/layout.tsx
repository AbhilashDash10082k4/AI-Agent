"use client"
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import NavigationContextProvider from "@/lib/NavigationProvider";
import { Authenticated } from "convex/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
        <NavigationContextProvider>
          <div className="flex h-screen">
            <Authenticated>
                <Sidebar/>
            </Authenticated>
           <div className="flex-1">
           <main>
            <Header/>
            {children}
            </main>
           </div>
        </div>
        </NavigationContextProvider>
    )
        
}
