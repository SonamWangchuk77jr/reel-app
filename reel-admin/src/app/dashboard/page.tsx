"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, CopySlash } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

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
        const fetchTotalUsers = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/total`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const data = await response.json();
            setTotalUsers(data.totalUsers);
        };

        const fetchTotalAds = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ads/total`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const data = await response.json();
            setTotalAds(data.totalAds);
        };

        const fetchTotalReels = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reels/total`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const data = await response.json();
            setTotalReels(data.totalReels);
        };

        const fetchTotalCategories = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/total`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            const data = await response.json();
            setTotalCategories(data.totalCategories);
        };

        fetchTotalUsers();
        fetchTotalAds();
        fetchTotalReels();
        fetchTotalCategories();
    }, [user?.token]);


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
                                    <h1 className="text-[20px] font-bold">{totalUsers}</h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-[#FB7D5B] rounded-full py-3 px-6">
                                    <Image src="/academicons_ads.svg" alt="ads" width={32} height={32} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Ads</p>
                                    <h1 className="text-[20px] font-bold">{totalAds}</h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-[#FCC43E] rounded-full py-3 px-6">
                                    <Image src="/reels.svg" alt="ads" width={35} height={35} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Reels</p>
                                    <h1 className="text-[20px] font-bold">{totalReels}</h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-primary rounded-full py-3 px-6">
                                    <CopySlash className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Categories</p>
                                    <h1 className="text-[20px] font-bold">{totalCategories}</h1>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 