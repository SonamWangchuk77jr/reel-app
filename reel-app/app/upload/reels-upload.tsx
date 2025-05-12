'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Dimensions, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { reelsUploadSchema } from '@/schema/reelsSchema';
import Toast from 'react-native-toast-message';
import { getReelsCategory } from '@/api/reelsCategory';
import DropDownPicker from 'react-native-dropdown-picker';
import * as yup from 'yup';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAuth } from '@/context/AuthContext';
import { createReel } from '@/api/reels';
import { useReels } from '@/context/ReelsContext';
import { useEvent } from 'expo';

type ReelsFormData = yup.InferType<typeof reelsUploadSchema>;

interface Category {
    _id: string;
    name: string;
}

interface DropdownItem {
    label: string;
    value: string;
}

const { width } = Dimensions.get('window');

export default function ReelsUpload() {
    const { token, user } = useAuth();
    const { refreshReels } = useReels();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const [items, setItems] = useState<DropdownItem[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const videoPlayer = useVideoPlayer(selectedVideo ? { uri: selectedVideo.uri } : null);
    const { isPlaying } = useEvent(videoPlayer, 'playingChange', { isPlaying: videoPlayer.playing });

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue: setFormValue,
    } = useForm<ReelsFormData>({
        resolver: yupResolver(reelsUploadSchema),
        defaultValues: {
            title: '',
            description: '',
            video: undefined,
            category: '',
        },
    });

    const styles = StyleSheet.create({
        videoContainer: {
            width: '100%',
            aspectRatio: 16 / 9,
            borderRadius: 8,
            overflow: 'hidden',
        },
        video: {
            width: '100%',
            height: '100%',
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        },
        progressContainer: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
        },
        progressText: {
            color: '#fff',
            marginTop: 10,
            fontSize: 16,
        },
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getReelsCategory();
                if (response && response.data && Array.isArray(response.data)) {
                    setCategories(response.data);
                    const formattedItems = response.data.map((category: Category) => ({
                        label: category.name,
                        value: category.name
                    }));
                    setItems(formattedItems);
                } else {
                    console.error('Invalid categories response:', response);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Invalid categories data received',
                    });
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load categories. Please try again.',
                });
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const pickVideo = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Required',
                    text2: 'Please grant camera roll permissions to select videos.',
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'],
                allowsEditing: true,
                quality: 1,
                videoMaxDuration: 60, // 1 minute max
                aspect: [9, 16], // Vertical video aspect ratio
            });

            if (!result.canceled) {
                setSelectedVideo(result.assets[0]);
                setFormValue('video', result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking video:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to pick video. Please try again.',
            });
        }
    };

    const onSubmit = async (data: ReelsFormData) => {
        if (!token || !user) {
            Toast.show({
                type: 'error',
                text1: 'Authentication Error',
                text2: 'Please login to upload reels',
            });
            return;
        }

        if (!selectedVideo) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please select a video to upload',
            });
            return;
        }

        if (!data.category) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please select a category',
            });
            return;
        }

        setIsLoading(true);
        setUploadProgress(0);
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('category', data.category);

            // Append the video file with correct properties
            formData.append('video', {
                uri: selectedVideo.uri,
                type: selectedVideo.mimeType || 'video/mp4',
                name: selectedVideo.fileName || 'video.mp4'
            } as any);

            // Simulate progress for demonstration
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 1000);

            await createReel(token, formData);
            setUploadProgress(100);

            // Refresh the reels list after successful upload
            await refreshReels(user.id);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Reel uploaded successfully!',
            });
            router.back();
        } catch (error: any) {
            console.error('Upload Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Upload Failed',
                text2: error.message || 'Something went wrong. Please try again.',
            });
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Create Reel',
                    headerStyle: {
                        backgroundColor: '#0C1319',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="ml-2"
                        >
                            <Feather name="chevron-left" size={30} color="#fff" />
                        </TouchableOpacity>
                    ),
                    headerTitleStyle: {
                        color: '#fff',
                        fontSize: 16,
                    },
                }}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-secondary"
            >
                {isLoading && (
                    <View style={styles.overlay}>
                        <View style={styles.progressContainer}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
                        </View>
                    </View>
                )}
                <View className="flex-1 p-4">
                    <View className="mb-10">
                        <TouchableOpacity
                            onPress={pickVideo}
                            className="bg-gray-800 p-4 rounded-lg border border-dashed border-gray-600 items-center justify-center"
                        >
                            {selectedVideo ? (
                                <View style={styles.videoContainer}>
                                    <VideoView
                                        style={styles.video}
                                        player={videoPlayer}
                                        nativeControls
                                        contentFit="cover"
                                        allowsFullscreen
                                    />
                                    <View className="flex-row items-center justify-center my-5">
                                        <Ionicons name="videocam" size={24} color="white" />
                                        <Text className="text-white ml-2">Change Video</Text>
                                    </View>
                                </View>
                            ) : (
                                <View className="items-center" style={{ height: 200 }}>
                                    <Ionicons name="videocam-outline" size={48} color="white" />
                                    <Text className="text-white mt-2">Select Video</Text>
                                    <Text className="text-gray-400 text-sm mt-1">Max 60 seconds</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {errors.video && (
                            <Text className="text-red-500 text-sm mt-2">{errors.video.message}</Text>
                        )}
                    </View>

                    <Controller
                        name="title"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <>
                                <TextInput
                                    placeholder="Enter reel title"
                                    value={value}
                                    onChangeText={onChange}
                                    className={`border border-gray-300 rounded-lg p-4 mb-2 text-white ${errors.title ? 'border-red-500' : ''
                                        }`}
                                    placeholderTextColor="#666"
                                />
                                {errors.title && (
                                    <Text className="text-red-500 text-sm mb-4">{errors.title.message}</Text>
                                )}
                            </>
                        )}
                    />

                    <Controller
                        name="description"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <>
                                <TextInput
                                    placeholder="Enter reel description"
                                    value={value}
                                    onChangeText={onChange}
                                    multiline
                                    numberOfLines={4}
                                    className={`border border-gray-300 rounded-lg p-4 mb-2 text-white ${errors.description ? 'border-red-500' : ''
                                        }`}
                                    placeholderTextColor="#666"
                                />
                                {errors.description && (
                                    <Text className="text-red-500 text-sm mb-4">{errors.description.message}</Text>
                                )}
                            </>
                        )}
                    />

                    <View className="mb-4 z-10">
                        {isLoadingCategories ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <DropDownPicker
                                    open={open}
                                    value={value}
                                    items={items}
                                    setOpen={setOpen}
                                    setValue={setValue}
                                    setItems={setItems}
                                    placeholder="Select a category"
                                    style={{
                                        backgroundColor: 'transparent',
                                        borderColor: errors.category ? '#ef4444' : '#374151',
                                        borderWidth: 1,
                                        borderRadius: 8,
                                    }}
                                    textStyle={{
                                        color: 'white',
                                    }}
                                    placeholderStyle={{
                                        color: '#666',
                                    }}
                                    dropDownContainerStyle={{
                                        backgroundColor: '#1f2937',
                                        borderColor: '#374151',
                                    }}
                                    onChangeValue={(value) => {
                                        if (value) {
                                            setFormValue('category', value);
                                            setValue(value);
                                        }
                                    }}
                                />
                                {errors.category && (
                                    <Text className="text-red-500 text-sm mt-2">{errors.category.message}</Text>
                                )}
                            </>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        className="bg-blue-500 p-4 rounded-lg mt-4"
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-bold">Upload Reel</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </>
    );
}