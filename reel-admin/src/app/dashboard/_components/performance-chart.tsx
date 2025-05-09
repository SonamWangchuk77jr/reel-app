"use client"

import { getUser } from "@/lib/auth";
import { CopySlash, Users, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Payload } from "recharts/types/component/DefaultLegendContent";

const allMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Custom Legend
function CustomLegend({
    payload,
    totals,
}: {
    payload?: Payload[];
    totals: { [key: string]: number };
}) {
    return (
        <div className="flex justify-end gap-4 mt-4">
            {payload &&
                payload.map((entry) => (
                    <div key={entry.value} className="flex items-start gap-2">
                        <span
                            className="inline-block w-4 h-4 mt-1 rounded-full"
                            style={{
                                display: "inline-block",
                                width: 18,
                                height: 14,
                                backgroundColor: "transparent",
                                borderRadius: 10,
                                border: `1px solid ${entry.color}`,
                            }}
                        />
                        <div className="flex flex-col justify-start">
                            <span className="text-sm text-gray-500">Total {entry.value}</span>
                            <span className="text-sm font-bold text-gray-500">
                                {totals[entry.value] ?? 0}
                            </span>
                        </div>
                    </div>
                ))}
        </div>
    );
}

// Custom Tooltip for AreaChart
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Payload[]; label?: string }) {
    if (!active || !payload || !payload.length) return null;
    // Find values by dataKey
    const users = payload.find((p) => p.dataKey === "totalNumberOfUser");
    const videos = payload.find((p) => p.dataKey === "totalNumberOfVideos");
    const ads = payload.find((p) => p.dataKey === "totalNumberOfAds");
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
            <div className="font-bold text-lg mb-2">{label}</div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="bg-[#6A73B1] rounded-full p-2">
                        <Users className="w-4 h-4 text-white" />
                    </span>
                    <span className="text-sm text-gray-500">Users:</span>
                    <span className="text-sm font-bold">{users ? users.value : 0}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-[#45358E] rounded-full p-2">
                        <Video className="w-4 h-4 text-white" />
                    </span>
                    <span className="text-sm text-gray-500">Videos:</span>
                    <span className="text-sm font-bold">{videos ? videos.value : 0}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-[#6927F6] rounded-full p-2">
                        <CopySlash className="w-4 h-4 text-white" />
                    </span>
                    <span className="text-sm text-gray-500">Ads:</span>
                    <span className="text-sm font-bold">{ads ? ads.value : 0}</span>
                </div>
            </div>
        </div>
    );
}

export default function PerformanceChart() {
    type MonthlyReport = {
        month: string;
        totalNumberOfUser: number;
        totalNumberOfVideos: number;
        totalNumberOfAds: number;
    };
    const [data, setData] = useState<MonthlyReport[]>([]);
    const user = getUser();
    const [isLoading, setIsLoading] = useState(false);

    console.log("user data", user?.token);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (user?.token) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/monthly-report`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user?.token}`
                    }
                });

                const apiData = await response.json();

                console.log("api data", apiData);


                // Create a map for quick lookup
                const dataMap = new Map<string, MonthlyReport>(apiData.map((item: MonthlyReport) => [item.month, item]));

                // Merge with all months, filling missing with zeroes
                const mergedData = allMonths.map(month => ({
                    month,
                    totalNumberOfUser: dataMap.get(month)?.totalNumberOfUser || 0,
                    totalNumberOfVideos: dataMap.get(month)?.totalNumberOfVideos || 0,
                    totalNumberOfAds: dataMap.get(month)?.totalNumberOfAds || 0,
                }));

                setData(mergedData);
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user?.token]);

    console.log("data", data);

    const totals = {
        Users: data.reduce((sum, item) => sum + item.totalNumberOfUser, 0),
        Videos: data.reduce((sum, item) => sum + item.totalNumberOfVideos, 0),
        Ads: data.reduce((sum, item) => sum + item.totalNumberOfAds, 0),
    };

    return (
        <div style={{ width: '100%', minHeight: 400 }}>
            <h2 style={{ fontWeight: 'bold', fontSize: 24, marginBottom: 16 }}>Performance</h2>
            {isLoading ? (
                <div style={{ width: '100%', height: 350, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)', backgroundSize: '400% 100%', animation: 'skeleton-loading 1.4s ease infinite', borderRadius: 12 }} />
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6A73B1" stopOpacity={0.7} />
                                <stop offset="95%" stopColor="#6A73B1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#45358E" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#45358E" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6927F6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#6927F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500 } }}
                        />
                        <YAxis
                            tick={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500 } }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            content={(props) => <CustomLegend {...props} totals={totals} />}
                            verticalAlign="top"
                            align="left"
                        />
                        <Area
                            type="monotone"
                            dataKey="totalNumberOfUser"
                            stroke="#6A73B1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorUsers)"
                            name="Users"
                        />
                        <Area
                            type="monotone"
                            dataKey="totalNumberOfVideos"
                            stroke="#45358E"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorVideos)"
                            name="Videos"
                        />
                        <Area
                            type="monotone"
                            dataKey="totalNumberOfAds"
                            stroke="#6927F6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAds)"
                            name="Ads"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
            <style>{`
                @keyframes skeleton-loading {
                    0% { background-position: 100% 50%; }
                    100% { background-position: 0 50%; }
                }
            `}</style>
        </div>
    );
}
