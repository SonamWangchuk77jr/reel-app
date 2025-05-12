import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { getRandomAds } from '../api/adsVidoe';
import { useAuth } from '../context/AuthContext';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEventListener } from 'expo';


interface AdsVideoProps {
    point: number;
    visible: boolean;
    onClose?: () => void;
}

const AdsVideoModal: React.FC<AdsVideoProps> = ({ point, visible, onClose }) => {
    const [ads, setAds] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();
    const videoViewRef = useRef<any>(null);
    const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);
    const [progress, setProgress] = useState(0); // percent (0-1)
    const [duration, setDuration] = useState<number | null>(null);
    const [player, setPlayer] = useState<any>(null);

    // Fetch ad and create player only when modal opens
    useEffect(() => {
        let isMounted = true;
        const fetchAdAndPlayer = async () => {
            setIsLoading(true);
            setError(null);
            setAds(null);
            setProgress(0);
            setDuration(null);
            setHasEnteredFullscreen(false);
            if (!token) return;
            try {
                const adData = await getRandomAds(point, token as string);
                if (!isMounted) return;
                setAds(adData);
                // Create player only after ad is loaded
                const newPlayer = useVideoPlayer(adData?.adsVideoUrl || null, (p) => {
                    if (adData?.adsVideoUrl) {
                        p.loop = false;
                        p.muted = false;
                        p.play();
                        p.timeUpdateEventInterval = 0.1;
                    }
                });
                setPlayer(newPlayer);
            } catch (err: any) {
                if (!isMounted) return;
                setError(err.message || 'Failed to load ad');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        if (visible && token) {
            fetchAdAndPlayer();
        }
        // Clean up on close
        if (!visible) {
            setAds(null);
            setPlayer(null);
            setProgress(0);
            setDuration(null);
            setHasEnteredFullscreen(false);
            setIsLoading(false);
            setError(null);
        }
        return () => { isMounted = false; };
    }, [visible, point, token]);

    // Listen for playToEnd event
    useEffect(() => {
        if (player) {
            useEventListener(player, 'playToEnd', () => {
                if (progress < 0.95) {
                    console.log('playToEnd fired too early, ignoring');
                    return;
                }
                if (videoViewRef.current) {
                    videoViewRef.current?.exitFullscreen?.();
                }
                if (onClose) {
                    onClose();
                }
            });
        }
    }, [player, progress, videoViewRef.current, onClose]);

    // Listen for statusChange event to get duration
    useEffect(() => {
        if (player) {
            useEventListener(player, 'statusChange', (payload: any) => {
                if (payload?.status?.duration) {
                    setDuration(payload.status.duration);
                }
            });
        }
    }, [player]);

    // Listen for timeUpdate event to update progress
    useEffect(() => {
        if (player) {
            useEventListener(player, 'timeUpdate', (payload) => {
                if (payload?.currentTime != null && duration && duration > 0) {
                    setProgress(Math.min(payload.currentTime / duration, 1));
                }
            });
        }
    }, [player, duration]);

    // Enter fullscreen when the ad and player are ready
    useEffect(() => {
        if (ads?.adsVideoUrl && videoViewRef.current && !hasEnteredFullscreen && visible) {
            setTimeout(() => {
                videoViewRef.current?.enterFullscreen?.();
                setHasEnteredFullscreen(true);
            }, 300);
        }
    }, [ads?.adsVideoUrl, videoViewRef.current, visible]);

    useEffect(() => {
        if (visible && player) {
            player.play();
        }
    }, [visible, player]);

    if (isLoading) {
        return <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>;
    }

    if (error) {
        return <View style={styles.centered}><Text>Error: {error}</Text></View>;
    }

    if (!ads) {
        return <View style={styles.centered}><Text>No ads found</Text></View>;
    }

    // Circle progress constants
    const size = 48;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressStroke = circumference * (1 - progress);


    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.fullscreenContainer}>
                {/* Top bar with timer and close button */}
                <View style={styles.topBar}>
                    <View style={styles.pillButton}>
                        <Text style={styles.pillButtonText}>
                            {duration ? `${Math.max(0, Math.ceil((duration * (1 - progress)))).toFixed(0)} seconds` : ''}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.pillButton}
                    >
                        <Text style={styles.pillButtonText}>✕ Close</Text>
                    </TouchableOpacity>
                </View>
                <VideoView
                    ref={videoViewRef}
                    player={player}
                    style={styles.fullscreenVideo}
                    allowsFullscreen
                    nativeControls={false}
                    contentFit="contain"
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#0a0a0a', // darker background
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 32, // for status bar
        paddingBottom: 8,
        zIndex: 9999,
        backgroundColor: 'rgba(10,10,10,0.95)',
    },
    pillButton: {
        backgroundColor: '#222c',
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 7,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    fullscreenVideo: {
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
});

export default AdsVideoModal;


