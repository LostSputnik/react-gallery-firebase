import { useState, useEffect } from 'react';
import { projectStorage, projectFirestore } from '../firebase/config'
import { ref, uploadBytesResumable, getDownloadURL } from '@firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'


const useStorage = (file) => {
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [url, setUrl] = useState(null);

    useEffect(() => {
        const storageRef = ref(projectStorage, file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', (snap) => {
            let percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
            setProgress(percentage);
        }, (err) => {
            setError(err);
        }, async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(collection(projectFirestore, 'images'), {
                url,
                createdAt: serverTimestamp()
            })
            setUrl(url);
        })        
    }, [file])

    return { progress, url, error }
}

export default useStorage;