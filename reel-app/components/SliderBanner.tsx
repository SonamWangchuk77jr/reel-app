import { useRef, useEffect, useState } from 'react';
import {
    View,
    Image,
    Animated,
    ScrollView,
    Dimensions,
    StyleSheet,
} from 'react-native';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width * 0.6;
const IMAGE_SPACING = 20;
const TOTAL_ITEM_WIDTH = IMAGE_WIDTH + IMAGE_SPACING;

const images = [
    require('@/assets/images/home/cham.jpg'),
    require('@/assets/images/home/paro-taktshang.jpg'),
    require('@/assets/images/home/bhudha-point.jpeg'),
    require('@/assets/images/home/gangkar-phuensum.jpeg'),
];

const SliderBanner = () => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto scroll effect
    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % images.length;
            setCurrentIndex(nextIndex);
            scrollViewRef.current?.scrollTo({
                x: nextIndex * TOTAL_ITEM_WIDTH,
                animated: true,
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [currentIndex]);

    // Listen to scroll position to update current index
    useEffect(() => {
        const listenerId = scrollX.addListener(({ value }) => {
            const index = Math.round(value / TOTAL_ITEM_WIDTH);
            if (index >= 0 && index < images.length) {
                setCurrentIndex(index);
            }
        });

        return () => {
            scrollX.removeListener(listenerId);
        };
    }, []);

    return (
        <View className="justify-center items-center mt-[50px]" style={{ marginTop: 50 }}>
            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: (width - IMAGE_WIDTH) / 2,
                }}
                snapToInterval={TOTAL_ITEM_WIDTH}
                decelerationRate="fast"
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                )}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / TOTAL_ITEM_WIDTH);
                    if (index >= 0 && index < images.length) {
                        setCurrentIndex(index);
                    }
                }}
            >
                {images.map((source, index) => {
                    const inputRange = [
                        (index - 1) * TOTAL_ITEM_WIDTH,
                        index * TOTAL_ITEM_WIDTH,
                        (index + 1) * TOTAL_ITEM_WIDTH,
                    ];

                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.85, 1, 0.85],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.imageContainer,
                                {
                                    transform: [{ scale }],
                                },
                            ]}
                        >
                            <Image
                                source={source}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </Animated.View>
                    );
                })}
            </Animated.ScrollView>

            {/* Indicator */}
            <View className="flex-row justify-center items-center mt-4">
                {images.map((_, index) => (
                    <View
                        key={index}
                        style={{
                            width: 20,
                            height: 4,
                            backgroundColor: currentIndex === index
                                ? '#28487B'
                                : '#B9CDEE',
                            marginHorizontal: 2,
                        }}

                        className={`w-5 h-[6px] mx-2 ${currentIndex === index
                            ? 'bg-primary'
                            : 'bg-[#B9CDEE]/80'
                            }`}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    imageContainer: {
        width: IMAGE_WIDTH,
        height: 280,
        marginHorizontal: IMAGE_SPACING / 2,
        borderRadius: 20,
        overflow: 'hidden',
    },
});

export default SliderBanner;