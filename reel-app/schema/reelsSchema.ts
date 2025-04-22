import * as yup from 'yup';
import { ImagePickerAsset } from 'expo-image-picker';

export const reelsUploadSchema = yup.object().shape({
    title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
    description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
    video: yup.mixed<ImagePickerAsset>().required('Video is required'),
    category: yup.string().required('Category is required'),
}); 