"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, CopySlash } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import PerformanceChart from "./_components/performance-chart"

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

    const [totalUsers, setTotalUsers] = useState(0);
    const [totalAds, setTotalAds] = useState(0);
    const [totalReels, setTotalReels] = useState(0);
    const [totalCategories, setTotalCategories] = useState(0);

    useEffect(() => {
        if (!user?.token) return;

        const statsData = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/total-users-videos-ads-categories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            console.log("statsData", data);
            setTotalUsers(data.totalUsers);
            setTotalAds(data.totalAds);
            setTotalReels(data.totalVideos);
            setTotalCategories(data.totalCategories);
        };
        statsData();
    }, [user]);


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Hello, <span className="capitalize">{user?.user?.name}</span></h1>
                <p className="text-gray-500">Welcome to your admin dashboard</p>
            </div>
            <div>
                <Card>
                    <CardContent>
                        <div className="flex justify-around gap-4 py-3">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#4D44B5] rounded-full py-3 px-6">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Users</p>
                                    <h1 className="text-[20px] font-bold">
                                        {(totalUsers ?? 0) < 10 ? `0${totalUsers ?? 0}` : totalUsers ?? 0}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-[#FB7D5B] rounded-full py-3 px-6">
                                    <Image src="/academicons_ads.svg" alt="ads" width={32} height={32} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Ads</p>
                                    <h1 className="text-[20px] font-bold">
                                        {(totalAds ?? 0) < 10 ? `0${totalAds ?? 0}` : totalAds ?? 0}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-[#FCC43E] rounded-full py-3 px-6">
                                    <Image src="/reels.svg" alt="ads" width={35} height={35} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Videos</p>
                                    <h1 className="text-[20px] font-bold">
                                        {(totalReels ?? 0) < 10 ? `0${totalReels ?? 0}` : totalReels ?? 0}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-primary rounded-full py-3 px-6">
                                    <CopySlash className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Categories</p>
                                    <h1 className="text-[20px] font-bold">
                                        {(totalCategories ?? 0) < 10 ? `0${totalCategories ?? 0}` : totalCategories ?? 0}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-4">
                    <Card>
                        <CardContent>
                            <PerformanceChart />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
} 