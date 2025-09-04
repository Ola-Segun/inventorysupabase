"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"

// LogoutButton component
// This component handles user logout functionality
// It uses the useAuth hook to access the logout method and router for navigation



export function LogoutButton() {
    const { signOut } = useSupabaseAuth()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await signOut()
            router.push('/login')
        } catch (err) {
            console.error("Logout error: ", err)
            // Still redirect even if logout fails
            router.push('/login')
        }
    }

    return (
        // This button accepts a click event to trigger the logout process
        <Button onClick={handleLogout}>
            {/* Allow user to add custom text or elements here when calling the button */}
            <span>Logout</span>
            {/* You can also add an icon or any other element here */}
        </Button>
    )
}
