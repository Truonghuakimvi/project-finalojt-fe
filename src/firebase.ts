import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCEoInIxcHHqAO8_VLW-EuzrWzX4-Uzu7A",
  authDomain: "project-finalojt.firebaseapp.com",
  projectId: "project-finalojt",
  storageBucket: "project-finalojt.appspot.com",
  messagingSenderId: "209983426465",
  appId: "1:209983426465:web:04a9d6e2680434c51b45e0",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
