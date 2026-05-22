import { useState } from 'react';
import { uploadFile } from '../firebase/storage';

/**
 * Hook to upload a file to Firebase Storage with progress tracking
 */
const useStorage = () => {
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [url, setUrl] = useState(null);

    const upload = async (file, path) => {
        setUploading(true);
        setError(null);
        setProgress(0);
        try {
            const downloadURL = await uploadFile(file, path, (p) => setProgress(p));
            setUrl(downloadURL);
            return downloadURL;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setUploading(false);
        }
    };

    return { upload, progress, uploading, error, url };
};

export default useStorage;
