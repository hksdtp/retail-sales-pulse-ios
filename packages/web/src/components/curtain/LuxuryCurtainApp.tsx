import React, { useState } from 'react';
import { Upload, X, ChevronRight, Check, Sparkles, Palette, Layers } from 'lucide-react';

const mockCurtainTypes = [
  { id: 1, name: 'Rèm Cửa Sổ Luxury', price: '5.000.000₫', image: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=400' },
  { id: 2, name: 'Mành Cuốn Cao Cấp', price: '3.500.000₫', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400' },
  { id: 3, name: 'Rèm Vải Nhung', price: '7.000.000₫', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { id: 4, name: 'Mành Sáo Gỗ', price: '4.500.000₫', image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400' }
];

const mockFabrics = [
  { id: 1, name: 'Lụa Tự Nhiên', texture: 'linear-gradient(45deg, #f3e5f5, #e1bee7)' },
  { id: 2, name: 'Nhung Cao Cấp', texture: 'linear-gradient(45deg, #3e2723, #5d4037)' },
  { id: 3, name: 'Vải Lanh', texture: 'linear-gradient(45deg, #f5f5dc, #e8e4d0)' },
  { id: 4, name: 'Polyester Chống Nắng', texture: 'linear-gradient(45deg, #eceff1, #cfd8dc)' }
];

const mockColors = [
  { id: 1, name: 'Trắng Ngà', hex: '#FFFFF0' },
  { id: 2, name: 'Xám Bạc', hex: '#C0C0C0' },
  { id: 3, name: 'Nâu Cafe', hex: '#6F4E37' },
  { id: 4, name: 'Xanh Navy', hex: '#000080' },
  { id: 5, name: 'Đỏ Burgundy', hex: '#800020' },
  { id: 6, name: 'Vàng Champagne', hex: '#F7E7CE' }
];

export default function LuxuryCurtainApp() {
  const [step, setStep] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedCurtain, setSelectedCurtain] = useState<any>(null);
  const [selectedFabric, setSelectedFabric] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      setGeneratedImage('https://images.unsplash.com/photo-1522444690501-ecaf4a92d9d7?w=800');
      setIsGenerating(false);
      setStep(5);
    }, 3000);
  };

  const resetApp = () => {
    setStep(0);
    setUploadedImage(null);
    setSelectedCurtain(null);
    setSelectedFabric(null);
    setSelectedColor(null);
    setGeneratedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">INCANTO</span>
            <span className="block text-2xl font-light text-gray-600 mt-1">Luxury Curtains Studio</span>
          </h1>
          {step > 0 && <p className="text-gray-600">Thiết kế mành rèm cao cấp cho không gian của bạn</p>}
        </header>

        {step > 0 && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <React.Fragment key={num}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step >= num ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white scale-110' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > num ? <Check className="w-5 h-5" /> : num}
                  </div>
                  {num < 5 && (
                    <div className={`w-20 h-0.5 transition-all duration-300 ${
                      step > num ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
          {step === 0 && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Sparkles className="w-20 h-20 mx-auto text-purple-600 mb-6" />
                <h2 className="text-3xl font-bold mb-4">Chào mừng đến với INCANTO</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Trải nghiệm công nghệ AI tiên tiến trong thiết kế mành rèm cao cấp
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">1. Tải ảnh cửa sổ</h3>
                  <p className="text-gray-600 text-sm">Chụp hoặc tải lên hình ảnh cửa sổ bạn muốn lắp đặt mành rèm</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Palette className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">2. Tùy chỉnh thiết kế</h3>
                  <p className="text-gray-600 text-sm">Lựa chọn kiểu dáng, chất liệu và màu sắc phù hợp với không gian</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">3. Xem trước với AI</h3>
                  <p className="text-gray-600 text-sm">Công nghệ AI sẽ tạo hình ảnh chân thực về không gian của bạn</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Tại sao chọn INCANTO?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Thiết kế độc quyền</p>
                      <p className="text-sm text-gray-600">Bộ sưu tập mành rèm cao cấp từ các nhà thiết kế hàng đầu</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Chất liệu Premium</p>
                      <p className="text-sm text-gray-600">Vải nhập khẩu từ Ý, Pháp với độ bền cao</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Tư vấn chuyên nghiệp</p>
                      <p className="text-sm text-gray-600">Đội ngũ kiến trúc sư nội thất giàu kinh nghiệm</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Bảo hành 5 năm</p>
                      <p className="text-sm text-gray-600">Cam kết chất lượng và dịch vụ hậu mãi</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg font-medium"
                >
                  Bắt đầu thiết kế
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
                <p className="text-sm text-gray-500 mt-4">Hoàn toàn miễn phí • Không cần đăng ký</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="text-center">
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Tải ảnh cửa sổ của bạn</h2>
              <p className="text-gray-600 mb-8">Chụp hoặc chọn ảnh cửa sổ bạn muốn lắp mành rèm</p>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  <Upload className="w-5 h-5 mr-2" />
                  Chọn ảnh
                </div>
              </label>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Chọn loại mành rèm</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockCurtainTypes.map((curtain) => (
                  <div
                    key={curtain.id}
                    onClick={() => {
                      setSelectedCurtain(curtain);
                      setStep(3);
                    }}
                    className={`cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      selectedCurtain?.id === curtain.id ? 'ring-4 ring-purple-600' : ''
                    }`}
                  >
                    <img src={curtain.image} alt={curtain.name} className="w-full h-40 object-cover" />
                    <div className="p-4 bg-gradient-to-t from-gray-100 to-white">
                      <h3 className="font-semibold text-gray-800">{curtain.name}</h3>
                      <p className="text-purple-600 font-bold">{curtain.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Chọn chất liệu vải</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockFabrics.map((fabric) => (
                  <div
                    key={fabric.id}
                    onClick={() => {
                      setSelectedFabric(fabric);
                      setStep(4);
                    }}
                    className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      selectedFabric?.id === fabric.id ? 'ring-4 ring-purple-600' : ''
                    }`}
                    style={{ background: fabric.texture }}
                  >
                    <Layers className="w-10 h-10 text-white mb-3 drop-shadow-lg" />
                    <h3 className="font-semibold text-white drop-shadow-lg">{fabric.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Chọn màu sắc</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {mockColors.map((color) => (
                  <div
                    key={color.id}
                    onClick={() => {
                      setSelectedColor(color);
                      handleGenerateImage();
                    }}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      selectedColor?.id === color.id ? 'ring-4 ring-purple-600' : ''
                    }`}
                  >
                    <div
                      className="w-full h-24 rounded-xl mb-2 shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                    <p className="text-sm text-center font-medium text-gray-700">{color.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 mx-auto text-purple-600 animate-pulse mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Đang tạo hình ảnh...</h2>
              <p className="text-gray-600">AI đang thiết kế mành rèm cho không gian của bạn</p>
            </div>
          )}

          {step === 5 && generatedImage && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Kết quả thiết kế</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Ảnh gốc</p>
                  <img src={uploadedImage} alt="Original" className="w-full rounded-2xl shadow-lg" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Với mành rèm của bạn</p>
                  <img src={generatedImage} alt="Generated" className="w-full rounded-2xl shadow-lg" />
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl">
                <h3 className="font-semibold text-lg mb-3">Thông tin đơn hàng</h3>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">Loại rèm:</span> {selectedCurtain?.name}</p>
                  <p><span className="font-medium">Chất liệu:</span> {selectedFabric?.name}</p>
                  <p><span className="font-medium">Màu sắc:</span> {selectedColor?.name}</p>
                  <p className="text-2xl font-bold text-purple-600 mt-4">{selectedCurtain?.price}</p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={resetApp}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300"
                >
                  Thiết kế lại
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  Đặt hàng ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
