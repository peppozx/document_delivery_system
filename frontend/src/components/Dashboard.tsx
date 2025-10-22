import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DocumentList from './DocumentList';
import UploadForm from './UploadForm';
import type { Document } from '../types';
import { documentsApi } from '../services/api';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [sentDocuments, setSentDocuments] = useState<Document[]>([]);
  const [receivedDocuments, setReceivedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');

      const [sentResponse, receivedResponse] = await Promise.all([
        documentsApi.getSentDocuments(),
        documentsApi.getReceivedDocuments(),
      ]);

      if (sentResponse.success && sentResponse.data) {
        setSentDocuments(sentResponse.data.documents);
      }

      if (receivedResponse.success && receivedResponse.data) {
        setReceivedDocuments(receivedResponse.data.documents);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchDocuments();
  };

  const handleDownload = async (documentId: string, filename: string) => {
    try {
      const blob = await documentsApi.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Refresh the documents list after download (view count may have changed)
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to download document');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentsApi.deleteDocument(documentId);
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to delete document');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Briefcase</h1>
              <p className="text-xs text-gray-500">Secure Document Delivery</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
          >
            {showUploadForm ? 'Cancel Upload' : 'Upload Document'}
          </button>
        </div>

        {showUploadForm && (
          <div className="mb-8">
            <UploadForm onSuccess={handleUploadSuccess} onCancel={() => setShowUploadForm(false)} />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading documents...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sent Documents</h2>
              <DocumentList
                documents={sentDocuments}
                emptyMessage="You haven't sent any documents yet"
                onDownload={handleDownload}
                onDelete={handleDelete}
                showRecipient={true}
              />
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Received Documents</h2>
              <DocumentList
                documents={receivedDocuments}
                emptyMessage="You haven't received any documents yet"
                onDownload={handleDownload}
                onDelete={null}
                showRecipient={false}
              />
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
