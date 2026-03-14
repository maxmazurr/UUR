const DB_NAME = 'studyflow_files';
const STORE = 'attachments';

// Cache the DB promise — open only once per page load
let dbPromise = null;
function getDB() {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = e => e.target.result.createObjectStore(STORE, { keyPath: 'id' });
            req.onsuccess = e => resolve(e.target.result);
            req.onerror = e => { dbPromise = null; reject(e.target.error); };
        });
    }
    return dbPromise;
}

function run(mode, fn) {
    return getDB().then(db => new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = e => reject(e.target.error);
    }));
}

export const fileStorage = {
    save:       (record)  => run('readwrite', s => s.put(record)),
    get:        (id)      => run('readonly',  s => s.get(id)),
    delete:     (id)      => run('readwrite', s => s.delete(id)),
    getByTopic: (topicId) => run('readonly',  s => s.getAll()).then(
        all => all.filter(f => f.topicId === topicId)
    ),
};

export function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function openFileFromDataUrl(dataUrl, mimeType) {
    const [, base64] = dataUrl.split(',');
    const binary = atob(base64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    const blob = new Blob([arr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
