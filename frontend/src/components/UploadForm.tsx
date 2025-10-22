import React, { useState, useEffect } from 'react';
import { usersApi, documentsApi } from '../services/api';
import type { User } from '../types';

interface UploadFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onSuccess, onCancel }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [viewLimit, setViewLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersApi.getUsers();
        if (response.success && response.data) {
          setUsers(response.data.users);
        }
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. You can still upload if you know the recipient ID.');
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!recipientId) {
      setError('Please select a recipient');
      return;
    }

    const parsedViewLimit = viewLimit ? parseInt(viewLimit, 10) : undefined;
    if (viewLimit && (isNaN(parsedViewLimit!) || parsedViewLimit! <= 0)) {
      setError('View limit must be a positive number');
      return;
    }

    const expirationDate = expiresAt || undefined;

    try {
      setLoading(true);
      const response = await documentsApi.uploadDocument(
        selectedFile,
        recipientId,
        parsedViewLimit,
        expirationDate
      );

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Document</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            Select File
          </label>
          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            required
          />
          {selectedFile && (
            <p className="mt-1 text-sm text-gray-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient
          </label>
          {usersLoading ? (
            <p className="text-sm text-gray-500">Loading users...</p>
          ) : (
            <select
              id="recipient"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select a recipient</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="viewLimit" className="block text-sm font-medium text-gray-700 mb-1">
            View Limit (Optional)
          </label>
          <input
            id="viewLimit"
            type="number"
            min="1"
            value={viewLimit}
            onChange={(e) => setViewLimit(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="Leave empty for unlimited views"
          />
          <p className="text-xs text-gray-500 mt-1">
            Number of times the document can be viewed before auto-deletion
          </p>
        </div>

        <div>
          <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
            Expiration Date (Optional)
          </label>
          <input
            id="expiresAt"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Document will be auto-deleted after this date
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !selectedFile || !recipientId}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
