/**
 * Service để cung cấp smart suggestions cho task titles
 * Phân tích patterns từ lịch sử công việc để đưa ra gợi ý thông minh
 */

export interface TaskSuggestion {
  id: string;
  title: string;
  category: string;
  frequency: number;
  lastUsed: Date;
  relatedCustomers?: string[];
  taskType?: string;
}

export interface SuggestionPattern {
  pattern: string;
  category: string;
  examples: string[];
  weight: number;
}

class TaskSuggestionService {
  private static instance: TaskSuggestionService;
  private suggestions: TaskSuggestion[] = [];
  private patterns: SuggestionPattern[] = [];

  private constructor() {
    this.initializeDefaultPatterns();
    this.loadSuggestionsFromStorage();
  }

  public static getInstance(): TaskSuggestionService {
    if (!TaskSuggestionService.instance) {
      TaskSuggestionService.instance = new TaskSuggestionService();
    }
    return TaskSuggestionService.instance;
  }

  /**
   * Khởi tạo các patterns mặc định dựa trên loại công việc
   */
  private initializeDefaultPatterns(): void {
    this.patterns = [
      // KTS (Khảo sát thiết kế)
      {
        pattern: 'khảo sát|thiết kế|đo đạc|survey',
        category: 'KTS',
        examples: [
          'Khảo sát thiết kế căn hộ',
          'Đo đạc hiện trạng công trình',
          'Thiết kế nội thất phòng khách',
          'Khảo sát địa điểm xây dựng',
          'Thiết kế kiến trúc nhà phố'
        ],
        weight: 0.9
      },
      // SBG (Sửa chữa bảo dưỡng)
      {
        pattern: 'sửa chữa|bảo dưỡng|maintenance|repair',
        category: 'SBG',
        examples: [
          'Sửa chữa hệ thống điện',
          'Bảo dưỡng máy lạnh',
          'Sửa chữa đường ống nước',
          'Bảo dưỡng thang máy',
          'Sửa chữa cửa sổ'
        ],
        weight: 0.8
      },
      // Khách hàng
      {
        pattern: 'khách hàng|customer|client|tư vấn',
        category: 'Customer',
        examples: [
          'Tư vấn khách hàng về dự án',
          'Gặp khách hàng thảo luận thiết kế',
          'Báo giá cho khách hàng',
          'Hỗ trợ khách hàng sau bán hàng',
          'Khảo sát nhu cầu khách hàng'
        ],
        weight: 0.85
      },
      // Đối tác
      {
        pattern: 'đối tác|partner|supplier|nhà cung cấp',
        category: 'Partner',
        examples: [
          'Họp với đối tác chiến lược',
          'Đàm phán hợp đồng nhà cung cấp',
          'Kiểm tra chất lượng từ đối tác',
          'Tìm kiếm đối tác mới',
          'Đánh giá hiệu suất đối tác'
        ],
        weight: 0.7
      },
      // Công việc khác
      {
        pattern: 'báo cáo|report|meeting|họp|training',
        category: 'Other',
        examples: [
          'Báo cáo tiến độ dự án',
          'Họp team hàng tuần',
          'Training nhân viên mới',
          'Chuẩn bị báo cáo tháng',
          'Họp với ban lãnh đạo'
        ],
        weight: 0.6
      }
    ];
  }

  /**
   * Load suggestions từ localStorage
   */
  private loadSuggestionsFromStorage(): void {
    try {
      const stored = localStorage.getItem('taskSuggestions');
      if (stored) {
        this.suggestions = JSON.parse(stored).map((s: any) => ({
          ...s,
          lastUsed: new Date(s.lastUsed)
        }));
      }
    } catch (error) {
      console.error('Error loading task suggestions:', error);
      this.suggestions = [];
    }
  }

  /**
   * Lưu suggestions vào localStorage
   */
  private saveSuggestionsToStorage(): void {
    try {
      localStorage.setItem('taskSuggestions', JSON.stringify(this.suggestions));
    } catch (error) {
      console.error('Error saving task suggestions:', error);
    }
  }

  /**
   * Thêm task mới vào lịch sử để học patterns
   */
  public learnFromTask(title: string, taskType?: string, customer?: string): void {
    const existingIndex = this.suggestions.findIndex(s => 
      s.title.toLowerCase() === title.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Tăng frequency cho suggestion đã có
      this.suggestions[existingIndex].frequency += 1;
      this.suggestions[existingIndex].lastUsed = new Date();
      if (customer && !this.suggestions[existingIndex].relatedCustomers?.includes(customer)) {
        this.suggestions[existingIndex].relatedCustomers?.push(customer);
      }
    } else {
      // Tạo suggestion mới
      const category = this.categorizeTitle(title);
      const newSuggestion: TaskSuggestion = {
        id: Date.now().toString(),
        title,
        category,
        frequency: 1,
        lastUsed: new Date(),
        relatedCustomers: customer ? [customer] : [],
        taskType
      };
      this.suggestions.push(newSuggestion);
    }

    // Giới hạn số lượng suggestions (giữ 100 gần nhất)
    if (this.suggestions.length > 100) {
      this.suggestions.sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
      this.suggestions = this.suggestions.slice(0, 100);
    }

    this.saveSuggestionsToStorage();
  }

  /**
   * Phân loại title dựa trên patterns
   */
  private categorizeTitle(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    for (const pattern of this.patterns) {
      const regex = new RegExp(pattern.pattern, 'i');
      if (regex.test(lowerTitle)) {
        return pattern.category;
      }
    }
    
    return 'Other';
  }

  /**
   * Lấy suggestions dựa trên input của user
   */
  public getSuggestions(input: string, limit: number = 5): TaskSuggestion[] {
    if (!input || input.length < 2) {
      // Trả về top suggestions gần đây nhất
      return this.suggestions
        .sort((a, b) => {
          // Ưu tiên frequency và thời gian sử dụng gần đây
          const scoreA = a.frequency * 0.7 + (Date.now() - a.lastUsed.getTime()) / (1000 * 60 * 60 * 24) * -0.3;
          const scoreB = b.frequency * 0.7 + (Date.now() - b.lastUsed.getTime()) / (1000 * 60 * 60 * 24) * -0.3;
          return scoreB - scoreA;
        })
        .slice(0, limit);
    }

    const lowerInput = input.toLowerCase();
    const matches: Array<TaskSuggestion & { score: number }> = [];

    // Tìm matches từ lịch sử
    this.suggestions.forEach(suggestion => {
      const lowerTitle = suggestion.title.toLowerCase();
      let score = 0;

      // Exact match có điểm cao nhất
      if (lowerTitle === lowerInput) {
        score = 100;
      }
      // Starts with
      else if (lowerTitle.startsWith(lowerInput)) {
        score = 80;
      }
      // Contains
      else if (lowerTitle.includes(lowerInput)) {
        score = 60;
      }
      // Fuzzy match (từng từ)
      else {
        const inputWords = lowerInput.split(' ');
        const titleWords = lowerTitle.split(' ');
        let matchedWords = 0;
        
        inputWords.forEach(inputWord => {
          if (titleWords.some(titleWord => titleWord.includes(inputWord))) {
            matchedWords++;
          }
        });
        
        if (matchedWords > 0) {
          score = (matchedWords / inputWords.length) * 40;
        }
      }

      // Bonus cho frequency và recency
      if (score > 0) {
        score += Math.min(suggestion.frequency * 2, 10);
        const daysSinceLastUsed = (Date.now() - suggestion.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(5 - daysSinceLastUsed, 0);
        
        matches.push({ ...suggestion, score });
      }
    });

    // Thêm pattern-based suggestions
    this.patterns.forEach(pattern => {
      pattern.examples.forEach(example => {
        const lowerExample = example.toLowerCase();
        if (lowerExample.includes(lowerInput) && 
            !matches.some(m => m.title.toLowerCase() === lowerExample)) {
          matches.push({
            id: `pattern-${Date.now()}-${Math.random()}`,
            title: example,
            category: pattern.category,
            frequency: 0,
            lastUsed: new Date(),
            score: 30 * pattern.weight
          });
        }
      });
    });

    // Sắp xếp theo score và trả về
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...suggestion }) => suggestion);
  }

  /**
   * Lấy suggestions dựa trên task type
   */
  public getSuggestionsByType(taskType: string, limit: number = 3): TaskSuggestion[] {
    return this.suggestions
      .filter(s => s.taskType === taskType || s.category === taskType)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  /**
   * Clear tất cả suggestions (for testing/reset)
   */
  public clearSuggestions(): void {
    this.suggestions = [];
    this.saveSuggestionsToStorage();
  }

  /**
   * Export suggestions data (for backup)
   */
  public exportSuggestions(): string {
    return JSON.stringify(this.suggestions, null, 2);
  }

  /**
   * Import suggestions data (for restore)
   */
  public importSuggestions(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      this.suggestions = imported.map((s: any) => ({
        ...s,
        lastUsed: new Date(s.lastUsed)
      }));
      this.saveSuggestionsToStorage();
      return true;
    } catch (error) {
      console.error('Error importing suggestions:', error);
      return false;
    }
  }
}

export default TaskSuggestionService;
