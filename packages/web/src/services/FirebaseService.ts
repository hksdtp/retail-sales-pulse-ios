import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  DocumentData,
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  FirebaseStorage,
  StorageReference,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private storage: FirebaseStorage | null = null;
  private initialized = false;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public static isConfigured(): boolean {
    try {
      const configStr = localStorage.getItem('firebaseConfig');
      if (!configStr) return false;

      const config = JSON.parse(configStr);
      return !!(config.apiKey && config.authDomain && config.projectId && config.appId);
    } catch (error) {
      console.error('Lỗi khi kiểm tra cấu hình Firebase:', error);
      return false;
    }
  }

  public static initializeApp(config: FirebaseConfig): FirebaseService {
    const instance = FirebaseService.getInstance();

    try {
      instance.app = initializeApp(config);
      instance.db = getFirestore(instance.app);

      if (config.storageBucket) {
        instance.storage = getStorage(instance.app);
      }

      instance.initialized = true;

      localStorage.setItem('firebaseConfig', JSON.stringify(config));

      console.log('Firebase đã được khởi tạo thành công');

      return instance;
    } catch (error) {
      console.error('Lỗi khi khởi tạo Firebase:', error);
      instance.initialized = false;
      throw error;
    }
  }

  public static initializeFromLocalStorage(): FirebaseService | null {
    try {
      const configStr = localStorage.getItem('firebaseConfig');
      if (!configStr) return null;

      const config = JSON.parse(configStr);
      return FirebaseService.initializeApp(config);
    } catch (error) {
      console.error('Lỗi khi khởi tạo Firebase từ localStorage:', error);
      return null;
    }
  }

  public getFirestore(): Firestore | null {
    if (!this.initialized || !this.db) {
      console.error('Firebase chưa được khởi tạo hoặc cấu hình không đúng');
      return null;
    }
    return this.db;
  }

  public getStorage(): FirebaseStorage | null {
    if (!this.initialized || !this.storage) {
      console.error('Firebase Storage chưa được khởi tạo hoặc cấu hình không đúng');
      return null;
    }
    return this.storage;
  }

  public async addDocument(
    collectionName: string,
    data: Record<string, unknown>,
  ): Promise<string | null> {
    if (!this.initialized || !this.db) {
      console.error('Firebase chưa được khởi tạo');
      return null;
    }

    try {
      const docRef = await addDoc(collection(this.db, collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error(`Lỗi khi thêm tài liệu vào ${collectionName}:`, error);
      return null;
    }
  }

  public async updateDocument(
    collectionName: string,
    docId: string,
    data: Record<string, unknown>,
  ): Promise<boolean> {
    if (!this.initialized || !this.db) {
      console.error('Firebase chưa được khởi tạo');
      return false;
    }

    try {
      const docRef = doc(this.db, collectionName, docId);
      await updateDoc(docRef, data);
      return true;
    } catch (error) {
      console.error(`Lỗi khi cập nhật tài liệu ${docId} trong ${collectionName}:`, error);
      return false;
    }
  }

  public async deleteDocument(collectionName: string, docId: string): Promise<boolean> {
    if (!this.initialized || !this.db) {
      console.error('Firebase chưa được khởi tạo');
      return false;
    }

    try {
      const docRef = doc(this.db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Lỗi khi xóa tài liệu ${docId} trong ${collectionName}:`, error);
      return false;
    }
  }

  public async getDocuments(collectionName: string): Promise<DocumentData[]> {
    if (!this.initialized || !this.db) {
      console.error('Firebase chưa được khởi tạo');
      return [];
    }

    try {
      const querySnapshot = await getDocs(collection(this.db, collectionName));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Lỗi khi lấy tài liệu từ ${collectionName}:`, error);
      return [];
    }
  }

  public async queryDocuments(
    collectionName: string,
    fieldPath: string,
    operator: '<' | '<=' | '==' | '!=' | '>' | '>=',
    value: unknown,
  ): Promise<DocumentData[]> {
    if (!this.initialized || !this.db) {
      console.error('Firebase chưa được khởi tạo');
      return [];
    }

    try {
      const q = query(collection(this.db, collectionName), where(fieldPath, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Lỗi khi truy vấn tài liệu từ ${collectionName}:`, error);
      return [];
    }
  }

  public async uploadFile(path: string, file: File): Promise<string | null> {
    if (!this.initialized || !this.storage) {
      console.error('Firebase Storage chưa được khởi tạo');
      return null;
    }

    try {
      const storageRef = ref(this.storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error(`Lỗi khi tải lên tệp ${path}:`, error);
      return null;
    }
  }
}

export default FirebaseService;
