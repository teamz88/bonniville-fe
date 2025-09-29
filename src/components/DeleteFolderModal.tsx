import React from 'react';
import { X, AlertTriangle, Folder, Trash2 } from 'lucide-react';
import { FolderItem } from '../types/files';

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  folder: FolderItem | null;
  isDeleting?: boolean;
}

const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  folder,
  isDeleting = false,
}) => {
  if (!isOpen || !folder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Folder
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Folder 
                className="w-5 h-5" 
                style={{ color: folder.color || '#3B82F6' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {folder.name}
              </h3>
              <p className="text-sm text-gray-500">
                {folder.files_count > 0 
                  ? `${folder.files_count} files inside` 
                  : 'Empty folder'
                }
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-red-800 font-medium mb-1">
                  This action cannot be undone
                </p>
                <p className="text-red-700">
                  {folder.files_count > 0 
                    ? `This will permanently delete the folder "${folder.name}" and all ${folder.files_count} files inside it.`
                    : `This will permanently delete the folder "${folder.name}".`
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            <p>Are you sure you want to delete this folder?</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Folder</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderModal;