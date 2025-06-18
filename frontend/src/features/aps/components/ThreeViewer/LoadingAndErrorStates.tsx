'use client';

interface LoadingAndErrorStatesProps {
  meshData: any[];
  isLoading: boolean;
  error: string | null;
  onErrorClose: () => void;
}

export function LoadingAndErrorStates({
  meshData,
  isLoading,
  error,
  onErrorClose
}: LoadingAndErrorStatesProps) {
  return (
    <>
      {/* ローディング状態 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Processing mesh data with element info...</p>
          </div>
        </div>
      )}

      {/* エラー状態 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4">
          <div className="bg-red-800 p-4 rounded-md max-w-md">
            <h3 className="text-lg font-bold mb-2">Error</h3>
            <p className="text-sm mb-3">{error}</p>
            <button
              onClick={onErrorClose}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* メッシュデータがない場合の表示 */}
      {!isLoading && !error && meshData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
          <div className="text-center p-6 bg-black/50 rounded-lg">
            <div className="text-lg mb-2">No mesh data available</div>
            <div className="text-sm text-gray-300 mb-4">
              Load a model in the APS Viewer and click "Extract Mesh"
            </div>
            <div className="text-xs text-gray-400">
              Steps:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Upload a file using the file uploader</li>
                <li>Wait for the model to load in APS Viewer</li>
                <li>Click the "Extract Mesh" button</li>
                <li>Interactive mesh data will appear here</li>
              </ol>
            </div>
            <div className="mt-4 p-3 bg-blue-900/50 rounded text-xs">
              <div className="font-semibold mb-1">Interactive Features:</div>
              <div>• Click elements to select and view properties</div>
              <div>• Hover elements for highlighting</div>
              <div>• Edit dimensional properties</div>
              <div>• View element information panel</div>
              <div>• Real-time property updates</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}