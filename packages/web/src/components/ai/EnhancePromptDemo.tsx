import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Languages, Copy, Check } from 'lucide-react';
import AIDisabledOverlay from '@/components/ui/AIDisabledOverlay';

const EnhancePromptDemo: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [enhancedEnglish, setEnhancedEnglish] = useState('');
  const [enhancedVietnamese, setEnhancedVietnamese] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleEnhancePrompt = async () => {
    if (!inputText.trim()) return;

    setIsEnhancing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock enhanced versions
    const mockEnglish = `Enhanced English Version:

${inputText}

This enhanced prompt provides:
- Clear context and objectives
- Specific requirements and constraints
- Expected output format
- Professional tone and structure
- Actionable instructions for optimal results`;

    const mockVietnamese = `Phiên bản tiếng Việt được cải thiện:

${inputText}

Prompt được cải thiện này cung cấp:
- Ngữ cảnh và mục tiêu rõ ràng
- Yêu cầu và ràng buộc cụ thể
- Định dạng đầu ra mong đợi
- Giọng điệu chuyên nghiệp và có cấu trúc
- Hướng dẫn có thể thực hiện để có kết quả tối ưu`;

    setEnhancedEnglish(mockEnglish);
    setEnhancedVietnamese(mockVietnamese);
    setIsEnhancing(false);
  };

  const copyToClipboard = async (text: string, tab: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(tab);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const resetForm = () => {
    setInputText('');
    setEnhancedEnglish('');
    setEnhancedVietnamese('');
    setCopiedTab(null);
  };

  return (
    <AIDisabledOverlay message="Tính năng Enhance Prompt AI tạm khóa để phát triển tiếp">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Enhance Prompt - Bilingual AI Enhancement
            </CardTitle>
            <CardDescription>
              Cải thiện prompt của bạn và dịch sang cả tiếng Anh và tiếng Việt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nhập prompt cần cải thiện:
              </label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập prompt hoặc nội dung cần cải thiện..."
                className="min-h-[120px]"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleEnhancePrompt}
                disabled={!inputText.trim() || isEnhancing}
                className="flex-1"
              >
                {isEnhancing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Đang cải thiện...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4 mr-2" />
                    Enhance Prompt (EN + VI)
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetForm}
                variant="outline"
                disabled={isEnhancing}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {(enhancedEnglish || enhancedVietnamese) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-blue-600" />
                Enhanced Results - Kết quả đã cải thiện
              </CardTitle>
              <CardDescription>
                Prompt đã được cải thiện và dịch sang 2 ngôn ngữ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="english" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="english" className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">EN</Badge>
                    English Version
                  </TabsTrigger>
                  <TabsTrigger value="vietnamese" className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">VI</Badge>
                    Tiếng Việt
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="english" className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Enhanced English Version</h4>
                    <Button
                      onClick={() => copyToClipboard(enhancedEnglish, 'english')}
                      variant="outline"
                      size="sm"
                    >
                      {copiedTab === 'english' ? (
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copiedTab === 'english' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <Textarea
                    value={enhancedEnglish}
                    readOnly
                    className="min-h-[200px] bg-blue-50/50 border-blue-200"
                  />
                </TabsContent>

                <TabsContent value="vietnamese" className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Phiên bản tiếng Việt đã cải thiện</h4>
                    <Button
                      onClick={() => copyToClipboard(enhancedVietnamese, 'vietnamese')}
                      variant="outline"
                      size="sm"
                    >
                      {copiedTab === 'vietnamese' ? (
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copiedTab === 'vietnamese' ? 'Đã copy!' : 'Copy'}
                    </Button>
                  </div>
                  <Textarea
                    value={enhancedVietnamese}
                    readOnly
                    className="min-h-[200px] bg-green-50/50 border-green-200"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900 mb-2">
                  Tính năng Enhance Prompt Bilingual
                </h4>
                <p className="text-sm text-purple-700 leading-relaxed">
                  Khi bạn ấn nút "Enhance Prompt", nội dung sẽ được AI cải thiện và tự động dịch sang 
                  <strong> cả tiếng Anh và tiếng Việt</strong>. Điều này giúp bạn có được phiên bản 
                  prompt tối ưu cho cả hai ngôn ngữ, phù hợp với nhiều mục đích sử dụng khác nhau.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AIDisabledOverlay>
  );
};

export default EnhancePromptDemo;
