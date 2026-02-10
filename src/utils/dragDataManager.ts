// src/utils/dragDataManager.ts

type DragData = {
  stationId: number;
  stationName: string;
  source: 'tree' | 'photo';
  originalX?: number;
  originalY?: number;
};

class DragDataManager {
  private static instance: DragDataManager;
  private data: DragData | null = null;
  private timestamp: number = 0;
  private readonly TIMEOUT = 10000; // 10 секунд

  private constructor() {}

  static getInstance(): DragDataManager {
    if (!DragDataManager.instance) {
      DragDataManager.instance = new DragDataManager();
    }
    return DragDataManager.instance;
  }

  setData(data: DragData): void {
    this.data = data;
    this.timestamp = Date.now();
    
    // Также сохраняем в localStorage как запасной вариант
    try {
      localStorage.setItem('dinamika-drag-data', JSON.stringify({
        data,
        timestamp: this.timestamp
      }));
    } catch (err) {
      console.warn('Не удалось сохранить в localStorage:', err);
    }
    
    console.log('💾 Drag данные сохранены:', data);
  }

  getData(): DragData | null {
    const now = Date.now();
    
    // Проверяем таймаут
    if (this.data && (now - this.timestamp) > this.TIMEOUT) {
      console.log('⏰ Данные истекли по таймауту');
      this.clearData();
      return null;
    }
    
    // Если нет в памяти, пробуем получить из localStorage
    if (!this.data) {
      try {
        const stored = localStorage.getItem('dinamika-drag-data');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Проверяем таймаут для localStorage
          if (now - parsed.timestamp < this.TIMEOUT) {
            this.data = parsed.data;
            this.timestamp = parsed.timestamp;
            console.log('📦 Данные восстановлены из localStorage:', this.data);
          } else {
            localStorage.removeItem('dinamika-drag-data');
          }
        }
      } catch (err) {
        console.warn('Ошибка чтения из localStorage:', err);
      }
    }
    
    return this.data;
  }

  clearData(): void {
    this.data = null;
    this.timestamp = 0;
    
    try {
      localStorage.removeItem('dinamika-drag-data');
    } catch (err) {
      // Игнорируем ошибки очистки localStorage
    }
    
    console.log('🧹 Drag данные очищены');
  }
}

export const dragDataManager = DragDataManager.getInstance();
export type { DragData };