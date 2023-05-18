import { initializeApp } from 'firebase/app';
import { getAuth, 
    signInWithRedirect, 
    signInWithPopup, 
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore, 
    doc, 
    getDoc, 
    setDoc,
    collection,
    writeBatch,
    query,
    getDocs,
    QuerySnapshot,
    DocumentSnapshot
} from 'firebase/firestore';




const firebaseConfig = {
    apiKey: "AIzaSyDJkalQ103ho3GFZwtcQhV8jO2Jp0LjDoU",
    authDomain: "crwn-clthn.firebaseapp.com",
    projectId: "crwn-clthn",
    storageBucket: "crwn-clthn.appspot.com",
    messagingSenderId: "324597988956",
    appId: "1:324597988956:web:65920c7a65db68e9abf099"
  };
  
  // Initialize Firebase
  const firebaseApp = initializeApp(firebaseConfig);

  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  export const auth = getAuth();
  export const signInWithGooglePopup = () => 
  signInWithPopup(auth, googleProvider);

  export const signInWithGoogleRedirect = () => 
  signInWithRedirect(auth, googleProvider);

  export const db = getFirestore();

  //using async when adding to or dealing with a db.
  export const addCollectionAndDocuments = async (collectionKey, objectsToAdd) => {
    const collectionRef = collection(db, collectionKey);
    //instantiate writeBatch then pass it the db.
    const batch = writeBatch(db);

    objectsToAdd.forEach((object) => {
        const docRef = doc(collectionRef, object.title.toLowerCase());
        batch.set(docRef, object);
    });

    await batch.commit();
    console.log('done')
}

    export const getCategoriesAndDocuments = async () => {
        const collectionRef = collection(db, 'catagories');
        const q = query(collectionRef);

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnapshot => docSnapshot.data())
    }

    export const createUserDocumentFromAuth = async (userAuth, 
    additionalInformation = {}) => {
        if(!userAuth) return;
    // doc() takes three arguments. Database, collection, and an identifier(can use the uid from google sign in)
        const userDocRef = doc(db, 'users', userAuth.uid);

        const userSnapshot = await getDoc(userDocRef);
        console.log(userSnapshot)
        console.log(userSnapshot.exists())
        //esixts() helps to show if a document exist in the collection

        if(!userSnapshot.exists()) {
            const {displayName, email} = userAuth;
            const createdAt = new Date();

            try {
                await setDoc(userDocRef, {
                    displayName, 
                    email, 
                    createdAt,
                    ...additionalInformation,
                });
                } catch (error) {
                    console.log('error creating the user', error.message);
            }
        }

        //check if user data exists

        //if user data doesn't exists create/ set the document with the data from 
        //userAuth in my collection.


        //if user data exists
        return userSnapshot;

  };

  export const createAuthUserWithEmailAndPassword = async (email, password) => {

    if(!email || !password) return;

    return await createUserWithEmailAndPassword(auth, email, password)
  };

  export const signInAuthUserWithEmailAndPassword = async (email, password) => {

    if(!email || !password) return;

    return await signInWithEmailAndPassword(auth, email, password)
  };

  export const signOutUser = async () => await signOut(auth);

  export const onAuthStateChangedListener = (callback) => 
  onAuthStateChanged(auth, callback)

  export const getCurrentUser = () => {
    return new Promise (( resolve, reject ) => {
        const unsubsribe = onAuthStateChanged(
    auth,
    (userAuth) => {
        // close listener so that there isn't a memory leak
        unsubsribe();
        resolve(userAuth);
        },
        reject
        )
    })
};