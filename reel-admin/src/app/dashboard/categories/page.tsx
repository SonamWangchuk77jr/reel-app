import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import React from 'react'

function CategoriesPage() {
    return (
        <div>
            <Tabs defaultValue="reels" className="w-full">
                <TabsList className='space-x-2'>
                    <TabsTrigger value="reels" className='data-[state=active]:bg-primary data-[state=active]:text-white border-2 border-primary w-[200px] cursor-pointer'>Reels</TabsTrigger>
                    <TabsTrigger value="reels-episodes" className='data-[state=active]:bg-primary data-[state=active]:text-white border-2 border-primary w-[200px] cursor-pointer'>Reels Episodes</TabsTrigger>
                </TabsList>
                <TabsContent value="reels">
                    {/* <ReelsCategories /> */}
                    <div className='w-full h-[500px] bg-red-500'>
                        <h1>Reels</h1>
                    </div>
                </TabsContent>
                <TabsContent value="reels-episodes">
                    {/* <ReelsEpisodes /> */}
                </TabsContent>
            </Tabs>

        </div>
    )
}

export default CategoriesPage