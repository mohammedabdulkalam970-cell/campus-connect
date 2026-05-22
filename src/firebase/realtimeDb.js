// Local Mock for Realtime Database

const getPathData = (path) => {
    return JSON.parse(localStorage.getItem('local_rtdb_' + path) || 'null');
};

const setPathData = (path, data) => {
    localStorage.setItem('local_rtdb_' + path, JSON.stringify(data));
    notifyPathSubscribers(path, data);
};

// Mock server timestamp
const serverTimestamp = () => Date.now();

// Subscribers map
const rtdbSubscribers = {};

const notifyPathSubscribers = (path, data) => {
    if (rtdbSubscribers[path]) {
        rtdbSubscribers[path].forEach(cb => cb(data));
    }
    // Also notify wildcard or parent paths if needed (simplified mock)
};

// Send a message to a chat room
export const sendMessage = async (roomId, message) => {
    const path = `chats_${roomId}_messages`;
    const messages = getPathData(path) || {};
    
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    messages[msgId] = { ...message, timestamp: serverTimestamp() };
    
    setPathData(path, messages);
    return { key: msgId };
};

// Subscribe to messages in a room
export const subscribeToMessages = (roomId, callback) => {
    const path = `chats_${roomId}_messages`;
    
    if (!rtdbSubscribers[path]) rtdbSubscribers[path] = [];
    
    const wrappedCallback = (data) => {
        if (data) {
            const messages = Object.entries(data).map(([id, msg]) => ({ id, ...msg }));
            callback(messages);
        } else {
            callback([]);
        }
    };
    
    rtdbSubscribers[path].push(wrappedCallback);
    
    // Initial call
    wrappedCallback(getPathData(path));
    
    // Return off() equivalent
    return () => {
        rtdbSubscribers[path] = rtdbSubscribers[path].filter(cb => cb !== wrappedCallback);
    };
};

// Set user presence (online/offline)
export const setUserPresence = (userId) => {
    const presencePath = `presence_${userId}`;
    const statusPath = `users_${userId}_status`;

    setPathData(presencePath, { online: true, lastSeen: serverTimestamp() });
    setPathData(statusPath, 'online');
    
    // In a real browser env, we can hook into beforeunload
    window.addEventListener('beforeunload', () => {
        setPathData(presencePath, { online: false, lastSeen: serverTimestamp() });
        setPathData(statusPath, 'offline');
    });
};

// Subscribe to a user's online status
export const subscribeToPresence = (userId, callback) => {
    const path = `presence_${userId}`;
    
    if (!rtdbSubscribers[path]) rtdbSubscribers[path] = [];
    rtdbSubscribers[path].push(callback);
    
    callback(getPathData(path));
    
    return () => {
        rtdbSubscribers[path] = rtdbSubscribers[path].filter(cb => cb !== callback);
    };
};

// Create or get a direct message room ID
export const getDMRoomId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
};

// Subscribe to typing indicator
export const setTyping = async (roomId, userId, isTyping) => {
    const path = `chats_${roomId}_typing`;
    const typing = getPathData(path) || {};
    
    if (isTyping) {
        typing[userId] = true;
    } else {
        delete typing[userId];
    }
    
    setPathData(path, typing);
};

export const subscribeToTyping = (roomId, callback) => {
    const path = `chats_${roomId}_typing`;
    
    if (!rtdbSubscribers[path]) rtdbSubscribers[path] = [];
    
    const wrappedCallback = (data) => callback(data || {});
    rtdbSubscribers[path].push(wrappedCallback);
    
    wrappedCallback(getPathData(path));
    
    return () => {
        rtdbSubscribers[path] = rtdbSubscribers[path].filter(cb => cb !== wrappedCallback);
    };
};
