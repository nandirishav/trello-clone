import { storage } from "@/appwrite";

const getImageUrl = async (image:Image) => {
    const url = storage.getFilePreview(image.bucketId, image.fileId)
    return url;
};


export default getImageUrl;