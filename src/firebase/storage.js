// Local Mock for Firebase Storage

/**
 * Upload a file with progress tracking
 * @param {File} file
 * @param {string} path - storage path e.g. 'notes/cse/semester-1/filename.pdf'
 * @param {function} onProgress - receives 0-100 progress value
 * @returns {Promise<string>} download URL
 */
export const uploadFile = (file, path, onProgress) => {
    return new Promise((resolve, reject) => {
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            if (onProgress) onProgress(progress);
            
            if (progress >= 100) {
                clearInterval(interval);
                
                // Convert file to Data URI to persist locally
                const reader = new FileReader();
                reader.onloadend = () => {
                    const dataUrl = reader.result;
                    // Save to local storage mock
                    const storageMap = JSON.parse(localStorage.getItem('local_storage_map') || '{}');
                    storageMap[path] = dataUrl;
                    
                    try {
                        localStorage.setItem('local_storage_map', JSON.stringify(storageMap));
                        resolve(dataUrl);
                    } catch (e) {
                        // If quota exceeded, just use blob URL
                        console.warn("Storage quota exceeded, using temporary blob URL");
                        const blobUrl = URL.createObjectURL(file);
                        resolve(blobUrl);
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }
        }, 200);
    });
};

/**
 * Delete a file from storage
 * @param {string} path - full storage path
 */
export const deleteFile = async (path) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const storageMap = JSON.parse(localStorage.getItem('local_storage_map') || '{}');
            delete storageMap[path];
            localStorage.setItem('local_storage_map', JSON.stringify(storageMap));
            resolve();
        }, 300);
    });
};

/**
 * Generate a storage path for a file
 */
export const getFilePath = (folder, department, semester, filename) =>
    `${folder}/${department}/semester-${semester}/${Date.now()}_${filename}`;

/**
 * Generate a profile image path
 */
export const getProfilePath = (userId, filename) =>
    `profiles/${userId}/${Date.now()}_${filename}`;
