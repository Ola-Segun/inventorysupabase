"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

// LogoutButton component
// This component handles user logout functionality
// It uses the useAuth hook to access the logout method and router for navigation



export function LogoutButton() {
    const { logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/auth')
        } catch (err) {
            console.error("Logout error: ", err)
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
