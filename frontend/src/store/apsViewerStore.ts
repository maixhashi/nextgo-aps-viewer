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
  fetchAccessToken: () => Promise<void>;
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
  setUrn: (urn) => {
    // URNを設定する際に、アクセストークンがなければ取得する
    set({ urn });
    const { accessToken } = get();
    if (!accessToken) {
      get().fetchAccessToken();
    }
  },
  setAccessToken: (accessToken) => set({ accessToken }),
  resetState: () => set({ 
    isLoading: false, 
    error: null, 
    urn: null, 
    accessToken: null 
  }),
  
  // アクセストークンのみを取得
  fetchAccessToken: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const url = `http://localhost:8080/api/v1/aps/token`;
      
      const response = await fetch(url, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `アクセストークンの取得に失敗しました: ${response.status} ${response.statusText} - ${
            JSON.stringify(errorData)
          }`
        );
      }
      
      const data = await response.json();
      
      set({ 
        accessToken: data.access_token,
        isLoading: false
      });
    } catch (error) {
      console.error('アクセストークンの取得中にエラーが発生しました:', error);
      set({ 
        error: error instanceof Error ? error.message : 'アクセストークンの取得中に不明なエラーが発生しました',
        isLoading: false
      });
    }
  },
  
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
