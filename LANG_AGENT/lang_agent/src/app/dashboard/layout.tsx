"use client"
import Header from "@/components/Header";
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
                <></>
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
