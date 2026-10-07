import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";


const firebaseConfig = {
    apiKey: "AIzaSyDv_Wka8Z52CogHeuxYzCu0RFBbm1uIlyY",
  authDomain: "campus-lost-found-9f284.firebaseapp.com",
  projectId: "campus-lost-found-9f284",
  storageBucket: "campus-lost-found-9f284.firebasestorage.app",
  messagingSenderId: "115995070091",
  appId: "1:115995070091:web:dab75a0781a11877244e8e"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);


// ===============================
// ADD A LOST / FOUND ITEM
// ===============================

export async function addPost(post) {
    try {
        const docRef = await addDoc(collection(db, "posts"), {
            title: post.title,
            type: post.type,
            category: post.category,
            description: post.description,
            location: post.location,
            date: post.date,
            contact: post.contact,
            imageURL: post.imageURL || "",
            createdAt: serverTimestamp()
        });

        return docRef.id;

    } catch (error) {
        console.error("Error adding post:", error);
        throw error;
    }
}


// ===============================
// GET ALL LOST / FOUND ITEMS
// ===============================

export async function getPosts() {
    try {
        const postsQuery = query(
            collection(db, "posts"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(postsQuery);

        const posts = [];

        snapshot.forEach((doc) => {
            posts.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return posts;

    } catch (error) {
        console.error("Error getting posts:", error);
        throw error;
    }
}
// ===============================
// GET ONE POST
// ===============================

export async function getPostById(id) {
    try {
        const postRef = doc(db, "posts", id);
        const snapshot = await getDoc(postRef);

        if (!snapshot.exists()) {
            return null;
        }

        return {
            id: snapshot.id,
            ...snapshot.data()
        };

    } catch (error) {
        console.error("Error getting post:", error);
        throw error;
    }
}