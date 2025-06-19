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
  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div className="text-gray-800">Loading mesh data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-600">Error</h3>
            <button
              onClick={onErrorClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <p className="text-gray-800 mb-4">{error}</p>
          <button
            onClick={onErrorClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return null;
}