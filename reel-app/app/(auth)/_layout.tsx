import React from 'react'
import { Stack } from 'expo-router'

const _Layout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
        </Stack>
    )
}

export default _Layout