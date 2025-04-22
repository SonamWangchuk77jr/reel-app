export interface Reel {
    _id: string;
    title: string;
    description: string;
    video: string;
    likeCount: number;
    saveCount: number;
    status: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        profilePicture: string;
    };
    createdAt: string;
    updatedAt: string;
    saves: string[];
} 