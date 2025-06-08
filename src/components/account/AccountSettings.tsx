
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Camera, Save, Eye, EyeOff, Check, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import passwordService from '@/services/passwordService';

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ isOpen, onClose }) => {
  const { currentUser, changePassword } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'avatar'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(currentUser?.name || '');
  const [editedEmail, setEditedEmail] = useState(currentUser?.email || '');

  // Password change states
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Avatar states
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Password validation
  const passwordRequirements = [
    { text: 'Ít nhất 6 ký tự', met: newPassword.length >= 6 },
    { text: 'Có chữ và số', met: /^(?=.*[A-Za-z])(?=.*\d)/.test(newPassword) },
    { text: 'Mật khẩu khớp nhau', met: newPassword === confirmPassword && newPassword.length > 0 }
  ];

  const isValidPassword = passwordRequirements.every(req => req.met);

  // Handle profile save
  const handleProfileSave = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Update user profile via API
      // For now, just update localStorage
      const updatedUser = { ...currentUser, name: editedName, email: editedEmail };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      setIsEditingProfile(false);
      toast({
        title: "Thành công",
        description: "Thông tin cá nhân đã được cập nhật"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle profile cancel
  const handleProfileCancel = () => {
    setEditedName(currentUser?.name || '');
    setEditedEmail(currentUser?.email || '');
    setIsEditingProfile(false);
  };

  // Handle password change
  const handlePasswordSave = async () => {
    if (!currentUser || !isValidPassword) return;

    setIsSubmitting(true);
    try {
      // Verify current password
      const isCurrentPasswordValid = passwordService.verifyPassword(currentUser.id, currentPassword);
      if (!isCurrentPasswordValid) {
        toast({
          title: "Lỗi",
          description: "Mật khẩu hiện tại không đúng",
          variant: "destructive"
        });
        return;
      }

      // Change password
      changePassword(newPassword);

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false);

      toast({
        title: "Thành công",
        description: "Mật khẩu đã được thay đổi"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thay đổi mật khẩu",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password cancel
  const handlePasswordCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsEditingPassword(false);
  };

  // Handle avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save avatar
  const handleAvatarSave = async () => {
    if (!selectedAvatar) return;

    setIsSubmitting(true);
    try {
      // TODO: Upload avatar to server
      // For now, just save to localStorage
      localStorage.setItem(`avatar_${currentUser?.id}`, selectedAvatar);

      setIsEditingAvatar(false);
      setSelectedAvatar(null);
      setAvatarFile(null);

      toast({
        title: "Thành công",
        description: "Ảnh đại diện đã được cập nhật"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật ảnh đại diện",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle avatar cancel
  const handleAvatarCancel = () => {
    setSelectedAvatar(null);
    setAvatarFile(null);
    setIsEditingAvatar(false);
  };

  // Get current avatar
  const getCurrentAvatar = () => {
    const savedAvatar = localStorage.getItem(`avatar_${currentUser?.id}`);
    return savedAvatar || null;
  };

  // Add/remove body class for modal
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div className="modal-backdrop" />

      {/* Modal Overlay */}
      <div className="modal-overlay account-settings-modal">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="modal-content account-settings-content bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-6 h-6 mr-3" />
              <div>
                <h2 className="text-xl font-bold">Cài đặt tài khoản</h2>
                <p className="text-blue-100 text-sm">{currentUser.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <div className="flex">
            {[
              { id: 'profile', label: 'Thông tin', icon: User },
              { id: 'password', label: 'Mật khẩu', icon: Lock },
              { id: 'avatar', label: 'Ảnh đại diện', icon: Camera }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
                {!isEditingProfile && (
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                  <Input
                    value={isEditingProfile ? editedName : currentUser.name}
                    onChange={(e) => setEditedName(e.target.value)}
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? "bg-gray-50" : ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    value={isEditingProfile ? editedEmail : currentUser.email}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? "bg-gray-50" : ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                  <Input value={currentUser.role === 'retail_director' ? 'Trưởng phòng' :
                               currentUser.role === 'team_leader' ? 'Trưởng nhóm' : 'Nhân viên'}
                         disabled className="bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ban</label>
                  <Input value={currentUser.department || 'Bán lẻ'} disabled className="bg-gray-50" />
                </div>
              </div>

              {isEditingProfile && (
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleProfileSave}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleProfileCancel}
                    variant="outline"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h3>
                {!isEditingPassword && (
                  <Button
                    onClick={() => setIsEditingPassword(true)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Đổi mật khẩu
                  </Button>
                )}
              </div>

              {!isEditingPassword ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Click "Đổi mật khẩu" để thay đổi mật khẩu của bạn.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
              
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Yêu cầu mật khẩu:</h4>
                <div className="space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center">
                      {req.met ? (
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 mr-2" />
                      )}
                      <span className={`text-sm ${req.met ? 'text-green-700' : 'text-gray-600'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handlePasswordSave}
                  disabled={!isValidPassword || !currentPassword || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu mật khẩu
                    </>
                  )}
                </Button>
                <Button
                  onClick={handlePasswordCancel}
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </div>
                </div>
              )}
            </div>
          )}

          {/* Avatar Tab */}
          {activeTab === 'avatar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Ảnh đại diện</h3>
                {!isEditingAvatar && (
                  <Button
                    onClick={() => setIsEditingAvatar(true)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Thay đổi
                  </Button>
                )}
              </div>
              
              {/* Current Avatar */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {getCurrentAvatar() || selectedAvatar ? (
                    <img 
                      src={selectedAvatar || getCurrentAvatar()!} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ảnh đại diện hiện tại</p>
                  <p className="text-xs text-gray-500">Kích thước tối đa: 2MB</p>
                </div>
              </div>

              {/* Upload New Avatar - Only show when editing */}
              {isEditingAvatar && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chọn ảnh mới</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  {/* Preview */}
                  {selectedAvatar && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Xem trước:</p>
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                        <img src={selectedAvatar} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={handleAvatarSave}
                      disabled={!selectedAvatar || isSubmitting}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Lưu ảnh đại diện
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleAvatarCancel}
                      variant="outline"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </motion.div>
      </div>
    </>
  );
};

export default AccountSettings;
