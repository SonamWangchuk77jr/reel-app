"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Activity, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type UserType = {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        createdAt: string;
        updatedAt: string;
    };
};

const stats = [
    {
        title: "Total Users",
        value: "1,234",
        icon: Users,
        description: "Active users this month",
        change: "+12.3%",
        trend: "up",
    },
    {
        title: "Revenue",
        value: "$45,231",
        icon: DollarSign,
        description: "Total revenue this month",
        change: "+8.2%",
        trend: "up",
    },
    {
        title: "Active Sessions",
        value: "573",
        icon: Activity,
        description: "Current active sessions",
        change: "-2.1%",
        trend: "down",
    },
    {
        title: "Growth",
        value: "+23.1%",
        icon: TrendingUp,
        description: "Compared to last month",
        change: "+4.3%",
        trend: "up",
    },
]

export default function DashboardPage() {
    const [user, setUser] = useState<UserType | null>(null);
    const router = useRouter();
    useEffect(() => {
        const userStr = typeof window !== 'undefined' ? sessionStorage.getItem('user') : null;
        if (!userStr) {
            router.push('/login');
            return;
        }
        try {
            const user = JSON.parse(userStr);
            setUser(user);
        } catch {
            sessionStorage.removeItem('user');
            router.push('/login');
        }
    }, [router]);
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Hello, {user?.user?.name}</h1>
                <p className="text-gray-500">Welcome to your admin dashboard</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-500">{stat.description}</p>
                                <span
                                    className={cn(
                                        "flex items-center text-xs font-medium",
                                        stat.trend === "up" ? "text-green-500" : "text-red-500"
                                    )}
                                >
                                    {stat.change}
                                    {stat.trend === "up" ? (
                                        <ArrowUpRight className="ml-1 h-3 w-3" />
                                    ) : (
                                        <ArrowDownRight className="ml-1 h-3 w-3" />
                                    )}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">New user registered</p>
                                    <p className="text-xs text-gray-500">2 minutes ago</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-secondary"></div>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">New order received</p>
                                    <p className="text-xs text-gray-500">5 minutes ago</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
                                Add New User
                            </button>
                            <button className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Generate Report
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 