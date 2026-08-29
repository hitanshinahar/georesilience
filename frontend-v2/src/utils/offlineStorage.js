const DB_NAME = 'GeoShieldDB';
const DB_VERSION = 1;
const STORE_NAME = 'pendingReports';

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => reject(event.target.error);
    
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localId' });
      }
    };
  });
};

export const savePendingReport = async (report) => {
  await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    if (!report.localId) report.localId = `loc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    if (!report.timestamp) report.timestamp = new Date().toISOString();
    
    const request = store.put(report);
    request.onsuccess = () => resolve(report);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const getPendingReports = async () => {
  await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
      // Sort by timestamp desc
      const results = request.result || [];
      results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      resolve(results);
    };
    request.onerror = (event) => reject(event.target.error);
  });
};

export const removePendingReport = async (localId) => {
  await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(localId);
    
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};
