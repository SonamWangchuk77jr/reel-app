import { useAuth } from "@/context/AuthContext";
import { Ads } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { View, Text, StatusBar, ActivityIndicator, Image, BackHandler } from "react-native";
import { VideoView, useVideoPlayer } from 'expo-video';
import { useRef, useEffect, useState } from "react";
import { getRandomAds } from "@/api/adsVidoe";
import { addKarmaPoints } from "@/api/karmaPoints";
import { useEventListener } from 'expo';
import { Svg, Circle } from 'react-native-svg';

export default function WatchAds() {
    const { point } = useLocalSearchParams<{ point: string }>();
    const { token } = useAuth();
    if (!token) {
        return <Text>No token</Text>
    }

    const { data: Ads, isLoading: isAdsLoading, error: adsError } = useQuery<Ads>({
        queryKey: ['point', point],
        queryFn: () => getRandomAds(Number(point || '0'), token),
    });

    const [remaining, setRemaining] = useState(0);

    // Create the player using useVideoPlayer
    const videoPlayer = useVideoPlayer(Ads?.adsVideoUrl || '', (p) => {
        if (Ads?.adsVideoUrl) {
            p.loop = false;
            p.muted = false;
            p.play();
        }
    });

    const videoViewRef = useRef<any>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    // Listen for video end
    useEventListener(videoPlayer, 'playToEnd', async () => {
        setShowSuccess(true);
        const response = await addKarmaPoints(token, Ads?.point || 0);
        console.log("playToEnd event fired, response:", response);
        if (response.karmaPoints) {
            setShouldRedirect(true);
        }
    });

    useEffect(() => {
        if (shouldRedirect) {
            const timeout = setTimeout(() => {
                router.push('/reward');
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [shouldRedirect]);

    useEffect(() => {
        const onBackPress = () => true;
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (videoPlayer?.currentTime && videoPlayer?.duration) {
                setRemaining(Math.ceil(videoPlayer.duration - videoPlayer.currentTime));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [videoPlayer]);


    if (isAdsLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0C1319' }}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (adsError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0C1319' }}>
                <Text style={{ color: 'white' }}>Error loading ad</Text>
            </View>
        );
    }

    if (!Ads?.adsVideoUrl) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0C1319' }}>
                <Text style={{ color: 'white' }}>No ad video found</Text>
            </View>
        );
    }

    if (showSuccess) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0C1319' }}>
                <View style={{
                    backgroundColor: '#D9D9D9',
                    borderRadius: 20,
                    padding: 30,
                    alignItems: 'center',
                }}>
                    <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#29406A',
                        position: 'absolute',
                        top: -20,
                        alignSelf: 'center',
                    }} />
                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 20 }}>Successful.</Text>
                    <View style={{
                        marginVertical: 20,
                        backgroundColor: '#FFE066',
                        borderRadius: 50,
                        width: 60,
                        height: 60,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Text style={{ fontSize: 30 }}>⭐</Text>
                    </View>
                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>+ {Ads?.point}</Text>
                    <Text style={{ marginTop: 10 }}>Reward added.</Text>
                </View>
            </View>
        );
    }

    console.log("Video URL:", Ads?.adsVideoUrl);

    return (
        <>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false, gestureEnabled: false, animation: 'none' }} />
            <View className="bg-secondary" style={{ position: 'relative', height: '100%' }}>
                <VideoView
                    ref={videoViewRef}
                    player={videoPlayer}
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                    allowsFullscreen
                    nativeControls={false}
                    contentFit="contain"
                />

                {/* Time Remaining - Improved UI/UX */}
                <View style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 }}>
                    <View style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <Svg width={60} height={60}>
                            <Circle
                                cx={30}
                                cy={30}
                                r={26}
                                stroke="#444"
                                strokeWidth={4}
                                fill="none"
                                opacity={0.2}
                            />
                            <Circle
                                cx={30}
                                cy={30}
                                r={26}
                                stroke="#00FF00"
                                strokeWidth={4}
                                fill="none"
                                strokeDasharray={2 * Math.PI * 26}
                                strokeDashoffset={2 * Math.PI * 26 * (1 - (videoPlayer?.currentTime && videoPlayer?.duration ? videoPlayer.currentTime / videoPlayer.duration : 0))}
                                strokeLinecap="round"
                                rotation="-90"
                                origin="30,30"
                            />
                        </Svg>
                        <View style={{ position: 'absolute', top: 0, left: 0, width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>{remaining}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </>
    );
}