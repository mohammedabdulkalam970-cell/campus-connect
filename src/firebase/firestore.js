// Local Storage Mock for Firestore

// Helper to manage collections
const getCollection = (collectionName) => JSON.parse(localStorage.getItem('local_db_' + collectionName) || '[]');
const saveCollection = (collectionName, data) => localStorage.setItem('local_db_' + collectionName, JSON.stringify(data));

// Mock server timestamp
export const serverTimestamp = () => Date.now();

// Add a document to a collection
export const addDocument = async (collectionName, data) => {
    const col = getCollection(collectionName);
    const newDoc = { 
        id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), 
        ...data, 
        createdAt: serverTimestamp() 
    };
    col.push(newDoc);
    saveCollection(collectionName, col);
    notifySubscribers(collectionName);
    return { id: newDoc.id };
};

// Set a document with a specific ID
export const setDocument = async (collectionName, docId, data) => {
    const col = getCollection(collectionName);
    const index = col.findIndex(d => d.id === docId);
    
    if (index !== -1) {
        col[index] = { ...col[index], ...data, updatedAt: serverTimestamp() };
    } else {
        col.push({ id: docId, ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    
    saveCollection(collectionName, col);
    notifySubscribers(collectionName);
};

// Get a single document
export const getDocument = async (collectionName, docId) => {
    const col = getCollection(collectionName);
    const doc = col.find(d => d.id === docId);
    return doc || null;
};

// Get all documents in a collection
export const getDocuments = async (collectionName) => {
    return getCollection(collectionName);
};

// Helper for querying and sorting
const processQuery = (col, conditions = [], ordering = null, limitCount = null) => {
    let result = [...col];
    
    // Apply where conditions
    conditions.forEach(cond => {
        result = result.filter(doc => {
            if (cond.operator === '==') return doc[cond.field] === cond.value;
            if (cond.operator === '!=') return doc[cond.field] !== cond.value;
            if (cond.operator === '<') return doc[cond.field] < cond.value;
            if (cond.operator === '<=') return doc[cond.field] <= cond.value;
            if (cond.operator === '>') return doc[cond.field] > cond.value;
            if (cond.operator === '>=') return doc[cond.field] >= cond.value;
            if (cond.operator === 'array-contains') return Array.isArray(doc[cond.field]) && doc[cond.field].includes(cond.value);
            return true;
        });
    });
    
    // Apply ordering
    if (ordering) {
        result.sort((a, b) => {
            let valA = a[ordering.field];
            let valB = b[ordering.field];
            
            if (valA < valB) return ordering.direction === 'desc' ? 1 : -1;
            if (valA > valB) return ordering.direction === 'desc' ? -1 : 1;
            return 0;
        });
    }
    
    // Apply limit
    if (limitCount) {
        result = result.slice(0, limitCount);
    }
    
    return result;
};

// Query documents
export const queryDocuments = async (collectionName, conditions = [], ordering = null, limitCount = null) => {
    const col = getCollection(collectionName);
    return processQuery(col, conditions, ordering, limitCount);
};

// Real-time subscription manager
const subscribers = {};

const notifySubscribers = (collectionName) => {
    if (subscribers[collectionName]) {
        const col = getCollection(collectionName);
        subscribers[collectionName].forEach(sub => {
            const result = processQuery(col, sub.conditions, sub.ordering, null);
            sub.callback(result);
        });
    }
};

// Real-time subscription
export const subscribeToCollection = (collectionName, callback, conditions = [], ordering = null) => {
    if (!subscribers[collectionName]) subscribers[collectionName] = [];
    
    const subId = Math.random().toString(36).substr(2, 9);
    subscribers[collectionName].push({ id: subId, callback, conditions, ordering });
    
    // Initial call
    const col = getCollection(collectionName);
    callback(processQuery(col, conditions, ordering, null));
    
    // Return unsubscribe function
    return () => {
        subscribers[collectionName] = subscribers[collectionName].filter(sub => sub.id !== subId);
    };
};

// Update a document
export const updateDocument = async (collectionName, docId, data) => {
    const col = getCollection(collectionName);
    const index = col.findIndex(d => d.id === docId);
    
    if (index !== -1) {
        col[index] = { ...col[index], ...data, updatedAt: serverTimestamp() };
        saveCollection(collectionName, col);
        notifySubscribers(collectionName);
    } else {
        throw new Error("Document not found");
    }
};

// Delete a document
export const deleteDocument = async (collectionName, docId) => {
    let col = getCollection(collectionName);
    col = col.filter(d => d.id !== docId);
    saveCollection(collectionName, col);
    notifySubscribers(collectionName);
};

// Array union helper
export const addToArray = async (collectionName, docId, field, value) => {
    const doc = await getDocument(collectionName, docId);
    if (!doc) throw new Error("Document not found");
    
    const arr = Array.isArray(doc[field]) ? doc[field] : [];
    if (!arr.includes(value)) {
        await updateDocument(collectionName, docId, { [field]: [...arr, value] });
    }
};

// Array remove helper
export const removeFromArray = async (collectionName, docId, field, value) => {
    const doc = await getDocument(collectionName, docId);
    if (!doc) throw new Error("Document not found");
    
    const arr = Array.isArray(doc[field]) ? doc[field] : [];
    await updateDocument(collectionName, docId, { [field]: arr.filter(item => item !== value) });
};

// Increment a numeric field
export const incrementField = async (collectionName, docId, field, amount = 1) => {
    const doc = await getDocument(collectionName, docId);
    if (!doc) throw new Error("Document not found");
    
    const currentVal = typeof doc[field] === 'number' ? doc[field] : 0;
    await updateDocument(collectionName, docId, { [field]: currentVal + amount });
};
