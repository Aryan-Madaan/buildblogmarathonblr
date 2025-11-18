
// --- MOCK FIRESTORE SERVICE ---
// This service simulates the behavior of Firestore using localStorage.
// It's designed to be easily replaceable with the actual Firebase SDK.

const MOCK_LATENCY = 300; // ms

const db = {
  get: (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error reading from mock DB (localStorage) for key: ${key}`, error);
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to mock DB (localStorage) for key: ${key}`, error);
    }
  }
};

// Simulates getting a single document
export const getDoc = async (key: string): Promise<{ exists: boolean; data: any | null }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const data = db.get(key);
      resolve({
        exists: data !== null,
        data: data,
      });
    }, MOCK_LATENCY);
  });
};

// Simulates setting/updating a single document
export const setDoc = async (key: string, data: any): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      db.set(key, data);
      resolve();
    }, MOCK_LATENCY);
  });
};

// Simulates getting all documents in a "collection" (just a prefix in our case)
export const getCollection = async (prefix: string): Promise<any[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const items = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const data = db.get(key);
                    if (data) items.push(data);
                }
            }
            resolve(items);
        }, MOCK_LATENCY);
    });
};
