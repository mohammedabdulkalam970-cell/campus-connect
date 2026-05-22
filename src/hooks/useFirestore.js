import { useState, useEffect } from 'react';
import { subscribeToCollection } from '../firebase/firestore';

/**
 * Subscribe to a Firestore collection in real-time
 * @param {string} collectionName
 * @param {Array} conditions - [{field, operator, value}]
 * @param {object} ordering - {field, direction}
 */
const useFirestore = (collectionName, conditions = [], ordering = null) => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        try {
            const unsubscribe = subscribeToCollection(collectionName, (data) => {
                setDocs(data);
                setLoading(false);
            }, conditions, ordering);
            return unsubscribe;
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionName]);

    return { docs, loading, error };
};

export default useFirestore;
