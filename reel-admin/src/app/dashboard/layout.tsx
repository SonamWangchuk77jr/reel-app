"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    ChartBarStacked,
    Video,
    ListVideo,
} from "lucide-react"
import { getAuthUser } from "@/lib/auth";

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
        title: "Reel Categories",
        href: "/dashboard/categories",
        icon: ChartBarStacked,
    },
    {
        title: "Content Moderation",
        href: "/dashboard/content-moderation",
        icon: Video,
    },
    {
        title: "Ads Management",
        href: "/dashboard/ads-management",
        icon: ListVideo,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

type UserType = {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    profilePicture?: string;
    password?: string;
    __v?: number;
};


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [user, setUser] = useState<UserType | null>(null);
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const userData = await getAuthUser();
            const user = userData as unknown as UserType;
            if (user && user.role !== 'Admin') {
                router.push('/login');
            }
            setUser(user);
        }
        getUser();
    }, [router]);

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed top-0 z-30 h-[calc(100vh)] w-64 border-r bg-[#0C1319] transition-transform",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                        "lg:translate-x-0"
                    )}
                >
                    <div className="flex items-center justify-center py-3">
                        <Image src="/logo-white.svg" alt="logo" width={100} height={100} priority />
                    </div>
                    <div className="h-full py-6">
                        <nav className="grid gap-1 pl-2">
                            {sidebarItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center justify-start gap-3 rounded-l-[20px] px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100",
                                        item.href === "/dashboard"
                                            ? pathname === item.href
                                                ? "bg-gray-100 text-primary"
                                                : "text-gray-500"
                                            : pathname.startsWith(item.href)
                                                ? "bg-gray-100 text-primary"
                                                : "text-gray-500"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                    {(item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)) && (
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
                                    sessionStorage.removeItem('user');
                                    router.push('/login');
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
                    {/* Top Navigation Bar */}
                    <header className="sticky top-0 z-50 w-full border-b bg-white">
                        <div className="w-full flex h-16 items-center px-8">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mr-2 lg:hidden"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            >
                                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                            <div className="flex flex-1 items-center justify-between w-full">
                                <div className="flex items-center space-x-4">
                                    {/* Page Title */}
                                    <h1 className="text-xl font-semibold">
                                        {sidebarItems.find(item => item.href === pathname)?.title || "Reels"}
                                    </h1>
                                </div>

                                {/* Admin Avatar */}
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <h6 className="text-sm font-semibold capitalize">{user?.name}</h6>
                                        <p className="text-xs text-gray-500">Admin</p>
                                    </div>
                                    {/* Admin Avatar */}
                                    {user?.profilePicture ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            width={40}
                                            height={40}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                                            <span className="uppercase">
                                                {user?.name && (() => {
                                                    const words = user.name.trim().split(' ').filter(Boolean);
                                                    return words.length ? words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '') : '';
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>
                    <div className="w-full p-8">{children}</div>
                </main>
            </div>
        </div>
    )
} 