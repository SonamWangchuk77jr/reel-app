"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Search,
    Bell,
} from "lucide-react"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Users",
        href: "/dashboard/users",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 w-full border-b bg-white">
                <div className="container flex h-16 items-center px-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 lg:hidden"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                    <div className="flex flex-1 items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <input
                                    type="search"
                                    placeholder="Search..."
                                    className="h-9 w-[200px] rounded-md border border-gray-200 bg-white px-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <Button variant="ghost" size="icon">
                                <Bell className="h-5 w-5" />
                            </Button>
                            <div className="h-8 w-8 rounded-full bg-primary"></div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-white transition-transform",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                        "lg:translate-x-0"
                    )}
                >
                    <div className="h-full py-6">
                        <nav className="grid gap-1 px-2">
                            {sidebarItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100",
                                        pathname === item.href
                                            ? "bg-gray-100 text-primary"
                                            : "text-gray-500"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                    {pathname === item.href && (
                                        <ChevronRight className="ml-auto h-4 w-4" />
                                    )}
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-auto px-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                onClick={() => {
                                    // TODO: Implement logout
                                    window.location.href = "/login"
                                }}
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main
                    className={cn(
                        "flex-1 transition-all",
                        isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
                    )}
                >
                    <div className="container p-8">{children}</div>
                </main>
            </div>
        </div>
    )
} 