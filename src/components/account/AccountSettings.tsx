import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, Eye, EyeOff, Check, User, Lock, Image } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import passwordService from '@/services/passwordService';

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSettings({ isOpen, onClose }: AccountSettingsProps) {
  const { currentUser, changePassword } = useAuth();
  const { toast } = useToast();

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.name || '',
    email: currentUser?.email || '',
    avatar: localStorage.getItem(`avatar_${currentUser?.id}`) || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linh'
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarPreview, setAvatarPreview] = useState(profileData.avatar);

  const tabs = [
    { id: 'profile', label: 'Thông tin', icon: User },
    { id: 'password', label: 'Mật khẩu', icon: Lock },
    { id: 'avatar', label: 'Ảnh đại diện', icon: Image }
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Update user profile
    const updatedUser = { ...currentUser, name: profileData.displayName, email: profileData.email };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    toast({
      title: "Thành công",
      description: "Thông tin cá nhân đã được cập nhật"
    });
  };

  const handleSavePassword = () => {
    if (!currentUser) return;

    // Verify current password
    const isCurrentPasswordValid = passwordService.verifyPassword(currentUser.id, passwordData.currentPassword);
    if (!isCurrentPasswordValid) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu hiện tại không đúng",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive"
      });
      return;
    }

    // Change password
    changePassword(passwordData.newPassword);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    toast({
      title: "Thành công",
      description: "Mật khẩu đã được thay đổi"
    });
  };

  const handleSaveAvatar = () => {
    localStorage.setItem(`avatar_${currentUser?.id}`, avatarPreview);
    setProfileData({...profileData, avatar: avatarPreview});

    toast({
      title: "Thành công",
      description: "Ảnh đại diện đã được cập nhật"
    });
  };

  if (!isOpen || !currentUser) return null;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .modal-animation {
          animation: modalSlideUp 0.3s cubic-bezier(0.68, -0.6, 0.32, 1.6);
        }
        
        .backdrop-animation {
          animation: fadeIn 0.2s ease-out;
        }
        
        .tab-indicator {
          transition: transform 0.3s cubic-bezier(0.68, -0.6, 0.32, 1.6);
        }
        
        input[type="file"] {
          display: none;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .button-press:active {
          transform: scale(0.98);
        }
        
        .input-focus {
          transition: all 0.2s ease;
        }
        
        .input-focus:focus {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }
      `}</style>

      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-xl backdrop-animation"
          onClick={onClose}
        />

        <div className="relative w-full max-w-lg max-h-[90vh] glass-effect rounded-3xl shadow-2xl overflow-hidden modal-animation flex flex-col">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200 button-press"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-white">Cài đặt tài khoản</h2>
            <p className="text-white/80 mt-1">{currentUser.name}</p>
          </div>
          
          <div className="bg-gray-50/50">
            <div className="flex border-b border-gray-200/50 relative">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-4 flex items-center justify-center gap-2 font-medium transition-all duration-200 ${
                    activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
              <div 
                className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
                style={{
                  width: `${100 / tabs.length}%`,
                  transform: `translateX(${tabs.findIndex(t => t.id === activeTab) * 100}%)`
                }}
              />
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Display Name Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Tên hiển thị
                    </label>
                    <button
                      onClick={() => setIsEditingName(!isEditingName)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {isEditingName ? 'Hủy' : 'Chỉnh sửa'}
                    </button>
                  </div>
                  {isEditingName ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none input-focus"
                        placeholder="Nhập tên của bạn"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            handleSaveProfile();
                            setIsEditingName(false);
                          }}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => {
                            setProfileData({...profileData, displayName: currentUser?.name || ''});
                            setIsEditingName(false);
                          }}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.displayName}</p>
                  )}
                </div>

                {/* Email Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <button
                      onClick={() => setIsEditingEmail(!isEditingEmail)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {isEditingEmail ? 'Hủy' : 'Chỉnh sửa'}
                    </button>
                  </div>
                  {isEditingEmail ? (
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none input-focus"
                        placeholder="Nhập email của bạn"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            handleSaveProfile();
                            setIsEditingEmail(false);
                          }}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => {
                            setProfileData({...profileData, email: currentUser?.email || ''});
                            setIsEditingEmail(false);
                          }}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.email}</p>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'password' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none input-focus"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none input-focus"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none input-focus"
                    placeholder="••••••••"
                  />
                </div>
                
                <button
                  onClick={handleSavePassword}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 button-press"
                >
                  Đổi mật khẩu
                </button>
              </div>
            )}
            
            {activeTab === 'avatar' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover shadow-xl"
                    />
                    <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Nhấn vào ảnh để tải lên ảnh mới hoặc chọn avatar có sẵn bên dưới
                  </p>
                </div>

                {/* Avatar Categories */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Avatar nam</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {['John', 'Mike', 'David', 'Alex', 'Tom', 'James', 'Robert', 'William'].map((name, i) => (
                        <button
                          key={name}
                          onClick={() => setAvatarPreview(`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`)}
                          className="p-2 rounded-xl hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-blue-200"
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                            alt={`Avatar ${name}`}
                            className="w-full h-full rounded-lg"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Avatar nữ</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {['Anna', 'Emma', 'Sophia', 'Olivia', 'Isabella', 'Mia', 'Charlotte', 'Amelia'].map((name, i) => (
                        <button
                          key={name}
                          onClick={() => setAvatarPreview(`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`)}
                          className="p-2 rounded-xl hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-blue-200"
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                            alt={`Avatar ${name}`}
                            className="w-full h-full rounded-lg"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Avatar động vật</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {['cat', 'dog', 'bear', 'fox', 'lion', 'tiger', 'panda', 'rabbit'].map((animal, i) => (
                        <button
                          key={animal}
                          onClick={() => setAvatarPreview(`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${animal}`)}
                          className="p-2 rounded-xl hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-blue-200"
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${animal}`}
                            alt={`Avatar ${animal}`}
                            className="w-full h-full rounded-lg"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveAvatar}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 button-press"
                >
                  Lưu ảnh đại diện
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}