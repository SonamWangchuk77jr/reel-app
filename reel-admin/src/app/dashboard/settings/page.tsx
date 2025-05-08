import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { UpdateUserForm } from "./_components/upadate-user-form"
import { ChangePassword } from "./_components/change-password"

export default function Settings() {
    return (
        <Tabs defaultValue="account">
            <div className="w-full rounded-lg flex shadow-lg border border-primary/30 md:mb-10 p-3">
                <TabsList className="flex gap-2">
                    <TabsTrigger value="account" className="w-[200px] data-[state=active]:bg-primary data-[state=active]:text-white bg-primary/30">Account</TabsTrigger>
                    <TabsTrigger value="password" className="w-[200px] data-[state=active]:bg-primary data-[state=active]:text-white bg-primary/30">Password</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="account">
                <Card>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>
                            Make changes to your account here. Click save when you&apos;re done.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <UpdateUserForm />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="password">
                <Card>
                    <CardHeader>
                        <CardTitle>Password</CardTitle>
                        <CardDescription>
                            Change your password here. After saving, you&apos;ll be logged out.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <ChangePassword />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
