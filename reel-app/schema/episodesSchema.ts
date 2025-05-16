import * as yup from 'yup';
import { ImagePickerAsset } from 'expo-image-picker';

export const episodesSchema = yup.object().shape({
    episodeNumber: yup.number().required('Episode number is required').min(0, 'Episode number must be 0 or greater'),
    episodeName: yup.string().required('Episode name is required').min(3, 'Episode name must be at least 3 characters'),
    description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
    caption: yup.string().required('Caption is required').min(3, 'Caption must be at least 3 characters'),
    video: yup.mixed<ImagePickerAsset>().required('Video is required'),
    isFree: yup.boolean().required('Free episode is required'),
}); 