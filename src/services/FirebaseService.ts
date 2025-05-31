
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, QuerySnapshot, DocumentData } from 'firebase/firestore';

class FirebaseService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private isConfiguredStatus = false;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const config = localStorage.getItem('firebaseConfig');
      if (config) {
        const firebaseConfig = JSON.parse(config);
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
        this.isConfiguredStatus = true;
        console.log('Firebase đã được cấu hình từ localStorage');
      }
    } catch (error) {
      console.error('Lỗi khi tải cấu hình Firebase:', error);
      this.isConfiguredStatus = false;
    }
  }

  configure(config: any) {
    try {
      localStorage.setItem('firebaseConfig', JSON.stringify(config));
      this.app = initializeApp(config);
      this.db = getFirestore(this.app);
      this.isConfiguredStatus = true;
      console.log('Firebase đã được cấu hình thành công');
      return true;
    } catch (error) {
      console.error('Lỗi khi cấu hình Firebase:', error);
      this.isConfiguredStatus = false;
      return false;
    }
  }

  isConfigured(): boolean {
    return this.isConfiguredStatus && this.db !== null;
  }

  async saveTask(task: any): Promise<boolean> {
    if (!this.isConfigured() || !this.db) {
      throw new Error('Firebase chưa được cấu hình');
    }

    try {
      const docRef = await addDoc(collection(this.db, 'tasks'), task);
      console.log('Đã lưu task với ID:', docRef.id);
      return true;
    } catch (error) {
      console.error('Lỗi khi lưu task:', error);
      throw error;
    }
  }

  async getTasks(): Promise<any[]> {
    if (!this.isConfigured() || !this.db) {
      throw new Error('Firebase chưa được cấu hình');
    }

    try {
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(this.db, 'tasks'));
      const tasks: any[] = [];
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return tasks;
    } catch (error) {
      console.error('Lỗi khi lấy tasks:', error);
      throw error;
    }
  }

  async updateTask(task: any): Promise<boolean> {
    if (!this.isConfigured() || !this.db) {
      throw new Error('Firebase chưa được cấu hình');
    }

    try {
      const taskRef = doc(this.db, 'tasks', task.id);
      await updateDoc(taskRef, task);
      console.log('Đã cập nhật task:', task.id);
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    if (!this.isConfigured() || !this.db) {
      throw new Error('Firebase chưa được cấu hình');
    }

    try {
      await deleteDoc(doc(this.db, 'tasks', taskId));
      console.log('Đã xóa task:', taskId);
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa task:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
