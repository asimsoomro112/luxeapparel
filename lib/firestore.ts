import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: any;
}

export const createUserProfile = async (user: any) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { displayName, email, photoURL, uid } = user;
    try {
      await setDoc(userRef, {
        uid,
        displayName,
        email,
        photoURL,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating user profile', error);
    }
  }
};

export const getProducts = async (category?: string) => {
  const productsRef = collection(db, 'products');
  let q = query(productsRef);
  
  if (category) {
    q = query(productsRef, where('category', '==', category));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createOrder = async (orderData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding order: ", e);
    throw e;
  }
};

export const getUserOrders = async (uid: string) => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('uid', '==', uid));
  const querySnapshot = await getDocs(q);
  // Sort descending by createdAt since we can't reliably orderBy with where without an index
  const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return orders.sort((a: any, b: any) => {
    const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
    const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
    return dateB - dateA;
  });
};

export const updateUserProfile = async (uid: string, data: any) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};
