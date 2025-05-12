import React from 'react'
import { Stack } from 'expo-router'

const _Layout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name='forgotpassword'
                options={{
                    headerShown: true,
                    headerTitle: '',
                    headerBackTitle: 'Back',
                    headerStyle: {
                        backgroundColor: "#0C1319",
                    },
                }}
            />
        </Stack>
    )
}

export default _Layout