import { create } from 'zustand';

interface APSViewerState {
  // ビューワーの状態
  isLoading: boolean;
  error: string | null;
  urn: string | null;
  accessToken: string | null;
  
  // アクション
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setUrn: (urn: string) => void;
  setAccessToken: (token: string) => void;
  resetState: () => void;
  
  // 設定の取得
  fetchConfig: () => Promise<void>;
}

export const useAPSViewerStore = create<APSViewerState>((set, get) => ({
  // 初期状態
  isLoading: false,
  error: null,
  urn: null,
  accessToken: null,
  
  // アクション
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setUrn: (urn) => set({ urn }),
  setAccessToken: (accessToken) => set({ accessToken }),
  resetState: () => set({ 
    isLoading: false, 
    error: null, 
    urn: null, 
    accessToken: null 
  }),
  
  // 設定の取得
  fetchConfig: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('/api/config');
      
      if (!response.ok) {
        throw new Error(`設定の取得に失敗しました: ${response.status}`);
      }
      
      const config = await response.json();
      
      set({ 
        accessToken: config.FORGE_ACCESS_TOKEN,
        urn: config.FORGE_MODEL_URN,
        isLoading: false
      });
    } catch (error) {
      console.error('設定の取得中にエラーが発生しました:', error);
      set({ 
        error: error instanceof Error ? error.message : '設定の取得中に不明なエラーが発生しました',
        isLoading: false
      });
    }
  }
}));
