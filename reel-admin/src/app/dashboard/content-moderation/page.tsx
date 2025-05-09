import { Tabs, TabsContent, TabsList, TabsTrigger, } from '@/components/ui/tabs'
import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import ReelsList from './_components/reels-list'
import EpisodeList from './_components/episode-list'


const ContentModerationPage = () => {
    return (
        <div>
            <Tabs defaultValue="reels" className="w-full">

                <div className="w-full rounded-lg flex shadow-lg border border-primary/30 md:mb-6 p-3">
                    <TabsList className="flex gap-2">
                        <TabsTrigger value="reels" className='data-[state=active]:bg-primary data-[state=active]:text-white border-2 border-primary w-[200px] cursor-pointer'>Reels</TabsTrigger>
                        <TabsTrigger value="reels-episodes" className='data-[state=active]:bg-primary data-[state=active]:text-white border-2 border-primary w-[200px] cursor-pointer'>Reels Episodes</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="reels">
                    <Card>
                        <CardHeader>
                            <CardTitle>Reels List</CardTitle>
                            <CardDescription>
                                View all the reels here and take action on them
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <ReelsList />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reels-episodes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Reels Episodes</CardTitle>
                            <CardDescription>
                                View all the reels episodes here and take action on them
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <EpisodeList />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ContentModerationPage