"use client"

//sharing of context or state without prop drilling, the context is consumed by using useContext
//this file deals with open, closing and current state of Sidenav bar
import { createContext, useState } from "react"

//isMobileNavOpen -> current state of side nav, setIsMobileNavOpen -> state of side nav, closeNav -> closing of nav; setIsMobileNavOpen to false
interface NavigationContextType {
    isMobileNavOpen: boolean;
    setIsMobileNavOpen: (open: boolean) => void;
    closeMobileNav: () => void;
}

// <> -> Enums
export const NavigationContext = createContext<NavigationContextType>({
    isMobileNavOpen: false,
    setIsMobileNavOpen: () => {},
    closeMobileNav: () => {}
});

export default function NavigationContextProvider({children,}:{children: React.ReactNode}) {
    
    //by default the navbar is not open
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    //closeMobileNav is a function that updates the val isMobileNavOpen to false i.e closes the mobile nav through setIsMobileNavOpen(false);
    const closeMobileNav = () => setIsMobileNavOpen(false);

    //value is passed in to define the current context which will be passed down to children
    return (
        <NavigationContext value={{isMobileNavOpen, setIsMobileNavOpen, closeMobileNav}}>
            {children}
        </NavigationContext>
    )
}