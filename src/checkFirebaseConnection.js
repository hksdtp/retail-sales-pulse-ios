// Kiểm tra kết nối Firebase
import { firebaseService } from './services/FirebaseService';

// Hàm kiểm tra kết nối Firebase
const checkConnection = async () => {
  if (firebaseService.isConfigured()) {
    try {
      console.log('Kiểm tra kết nối Firebase...');
      const tasks = await firebaseService.getTasks();
      console.log('✅ Kết nối Firebase thành công!');
      console.log(`- Số lượng công việc đã đồng bộ: ${tasks.length}`);
      return { status: true, tasks };
    } catch (error) {
      console.error('❌ Lỗi kết nối Firebase:', error);
      return { status: false, error };
    }
  } else {
    console.error('❌ Firebase chưa được cấu hình đúng cách');
    return { status: false, error: 'Chưa cấu hình' };
  }
};

// Thực hiện kiểm tra khi file được import
checkConnection().then(result => {
  if (result.status) {
    console.log('🔄 Dữ liệu đã sẵn sàng đồng bộ');
  } else {
    console.log('⚠️ Vui lòng kiểm tra lại cấu hình Firebase');
  }
});
