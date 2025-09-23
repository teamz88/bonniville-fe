import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, MessageCircle, ChevronLeft, ChevronRight, Eye, Download, RefreshCw } from 'lucide-react';
import ChatHistoryModal from '../components/ChatHistoryModal';
import { analyticsApi } from '../services/api';

interface QAData {
  id: number;
  user: {
    id: number;
    email: string;
    full_name: string;
  };
  question: string;
  answer: string;
  question_time: string;
}

interface QAResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: QAData[];
}

const QAManagement: React.FC = () => {
  const [qaData, setQaData] = useState<QAData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedUserForChat, setSelectedUserForChat] = useState<QAData['user'] | null>(null);
  const [users, setUsers] = useState<Array<{ id: number; email: string; full_name: string }>>([]);

  useEffect(() => {
    fetchQAData();
    fetchUsers();
  }, [currentPage, searchTerm, selectedUser, dateFrom, dateTo]);

  const fetchUsers = async () => {
    try {
      // This would typically be an API call to get all users
      // For now, we'll extract unique users from QA data
      const response = await analyticsApi.getQAData({ page: 1, page_size: 100 });
      const uniqueUsers = response.data.results.reduce((acc: Array<{ id: number; email: string; full_name: string }>, item) => {
        if (!acc.find(user => user.id === item.user.id)) {
          acc.push(item.user);
        }
        return acc;
      }, []);
      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchQAData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        page_size: pageSize,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedUser) params.user = selectedUser;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await analyticsApi.getQAData(params);
      setQaData(response.data.results);
      setTotalCount(response.data.count);
      setTotalPages(Math.ceil(response.data.count / pageSize));
    } catch (error) {
      console.error('Error fetching QA data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQAData();
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedUser('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewChatHistory = (user: QAData['user']) => {
    setSelectedUserForChat(user);
    setShowChatModal(true);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'User Email', 'User Name', 'Question', 'Answer', 'Question Time'];
    const csvContent = [
      headers.join(','),
      ...qaData.map(item => [
        item.id,
        `"${item.user.email}"`,
        `"${item.user.full_name}"`,
        `"${item.question.replace(/"/g, '""')}"`,
        `"${item.answer.replace(/"/g, '""')}"`,
        item.question_time
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `qa-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Q&A Management</h1>
          <p className="text-gray-600">Monitor and analyze user questions and AI responses</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {qaData.length} of {totalCount} results
            </div>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>

        {/* QA Data Table/Cards */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading Q&A data...</span>
            </div>
          ) : qaData.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Q&A data found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or date range.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Question
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Answer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {qaData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {item.user.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {truncateText(item.question, 100)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {truncateText(item.answer, 100)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(item.question_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewChatHistory(item.user)}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Chat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                <div className="divide-y divide-gray-200">
                  {qaData.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {item.user.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.user.email}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewChatHistory(item.user)}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Chat
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Question
                          </div>
                          <div className="text-sm text-gray-900">
                            {item.question}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Answer
                          </div>
                          <div className="text-sm text-gray-900">
                            {item.answer}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Time
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(item.question_time)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium bg-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    color: 'var(--sidebar-text)',
                    backgroundColor: 'var(--card)'
                  }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? ''
                            : 'border hover:opacity-90'
                        }`}
                        style={currentPage === pageNum ? {
                          backgroundColor: 'var(--main-yellow)',
                          color: '#fff'
                        } : {
                          color: 'var(--sidebar-text)',
                          backgroundColor: 'var(--card)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium bg-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    borderColor: 'var(--border)', 
                    color: 'var(--sidebar-text)',
                    backgroundColor: 'var(--card)'
                  }}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              <div className="text-sm" style={{ color: 'var(--sidebar-text)' }}>
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat History Modal */}
      <ChatHistoryModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        user={selectedUserForChat}
      />
    </div>
  );
};

export default QAManagement;