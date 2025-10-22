import React from 'react';
import type { Document } from '../types';

interface DocumentListProps {
  documents: Document[];
  emptyMessage: string;
  onDownload: (documentId: string, filename: string) => void;
  onDelete: ((documentId: string) => void) | null;
  showRecipient: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  emptyMessage,
  onDownload,
  onDelete,
  showRecipient,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (size: string | number): string => {
    const bytes = typeof size === 'string' ? parseInt(size, 10) : size;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const isExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isViewLimitReached = (doc: Document): boolean => {
    if (doc.view_limit === null) return false;
    return doc.view_count >= doc.view_limit;
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filename
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              {showRecipient && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
              )}
              {!showRecipient && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sender
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc) => {
              const expired = isExpired(doc.expires_at);
              const limitReached = isViewLimitReached(doc);
              const canDownload = !expired && !limitReached;

              return (
                <tr key={doc.id} className={expired || limitReached ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.filename}</div>
                        <div className="text-xs text-gray-500">{doc.mime_type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(doc.size)}
                  </td>
                  {showRecipient && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.recipient?.username}</div>
                      <div className="text-xs text-gray-500">{doc.recipient?.email}</div>
                    </td>
                  )}
                  {!showRecipient && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.sender?.username}</div>
                      <div className="text-xs text-gray-500">{doc.sender?.email}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {doc.view_count} {doc.view_limit !== null && `/ ${doc.view_limit}`}
                    </div>
                    {limitReached && (
                      <span className="text-xs text-red-600 font-medium">Limit reached</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doc.expires_at ? (
                      <div>
                        <div className="text-sm text-gray-900">
                          {formatDate(doc.expires_at)}
                        </div>
                        {expired && (
                          <span className="text-xs text-red-600 font-medium">Expired</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onDownload(doc.id, doc.filename)}
                      disabled={!canDownload}
                      className={`${
                        canDownload
                          ? 'text-indigo-600 hover:text-indigo-900'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Download
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;
