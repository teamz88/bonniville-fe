import React, { useState, useEffect } from 'react';
import { X, MessageCircle, User, Bot, Calendar, Clock, ArrowLeft, Copy, Check, ExternalLink, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { chatApi } from '../services/api';
import { ChatMessage, Conversation } from '../types/chat';

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    email: string;
    full_name: string;
  } | null;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ isOpen, onClose, user }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showMessages, setShowMessages] = useState(false); // For mobile navigation
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadUserConversations();
    }
  }, [isOpen, user]);

  const loadUserConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Note: This assumes there's an API endpoint to get conversations by user
      // You may need to modify the API to support filtering by user ID
      const response = await chatApi.getConversations();
      setConversations(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load user conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const response = await chatApi.getConversationHistory(conversationId);
      setMessages(response.data.results || response.data);
      setSelectedConversation(conversationId);
      setShowMessages(true);
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const goBackToConversations = () => {
    setShowMessages(false);
    setSelectedConversation(null);
    setMessages([]);
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {showMessages && (
              <button
                onClick={goBackToConversations}
                className="mr-3 p-1 rounded-md hover:bg-gray-100 md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center">
              <User className="h-6 w-6 text-gray-600 mr-2" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.full_name || 'User'}
                </h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Conversations List */}
          <div className={`${showMessages ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-gray-200 overflow-y-auto`}>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Conversations ({conversations.length})
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No conversations found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => loadConversationMessages(conversation.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedConversation === conversation.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {conversation.title || 'Untitled Conversation'}
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDateTime(conversation.updated_at)}
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {conversation.message_count || 0}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className={`${showMessages ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Messages</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {messagesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No messages in this conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.message_type === 'user' ? (
                            // User message - right aligned
                            <div className="flex items-start gap-3 w-full max-w-4xl justify-end">
                              <div className="rounded-xl px-5 py-4 shadow-sm text-black max-w-3xl group relative">
                                  {/* Copy button */}
                                  <button
                                    onClick={() => copyToClipboard(message.content, message.id)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black hover:bg-opacity-10"
                                    title="Copy message"
                                  >
                                    {copiedMessageId === message.id ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Copy className="h-4 w-4 text-gray-700" />
                                    )}
                                  </button>
                                 <div className="prose prose-sm max-w-none">
                                   <div className="text-sm whitespace-pre-wrap">
                                     {message.content}
                                   </div>
                                 </div>
                                 <div className="text-xs text-gray-600 mt-2 text-right">
                                   {formatDateTime(message.created_at)}
                                 </div>
                               </div>
                               <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-black text-base font-medium flex-shrink-0 shadow-md">
                                 <User className="h-5 w-5" />
                               </div>
                            </div>
                          ) : (
                            // Assistant message - left aligned
                            <div className="flex items-start gap-3 w-full max-w-4xl">
                              <div className="w-10 h-10 rounded-full bg-black overflow-hidden flex items-center justify-center text-white text-base font-medium flex-shrink-0 shadow-md">
                                 <img src="/bon_fav.png" alt="Bonneville" className="w-8 h-8" />
                               </div>
                               <div className="rounded-xl px-5 py-4 shadow-sm bg-gray-100 text-gray-900 max-w-3xl group relative">
                                 {/* Copy button */}
                                 <button
                                   onClick={() => copyToClipboard(message.content, message.id)}
                                   className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200"
                                   title="Copy message"
                                 >
                                   {copiedMessageId === message.id ? (
                                     <Check className="h-4 w-4 text-green-600" />
                                   ) : (
                                     <Copy className="h-4 w-4 text-gray-500" />
                                   )}
                                 </button>
                                <div className="prose prose-sm max-w-none">
                                  {message.isHtml ? (
                                    <div 
                                      className="text-sm"
                                      dangerouslySetInnerHTML={{ 
                                        __html: message.content
                                      }}
                                    />
                                  ) : (
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      rehypePlugins={[rehypeHighlight]}
                                      components={{
                                        div: ({ className, ...props }) => (
                                          <div className={`text-sm ${className || ''}`} {...props} />
                                        ),
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li className="text-sm">{children}</li>,
                                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                                        code: ({ children, ...props }: any) => {
                                           const isInline = !props.className?.includes('language-');
                                           return isInline ? (
                                             <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                                           ) : (
                                             <code className="block bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto">{children}</code>
                                           );
                                         },
                                        pre: ({ children }) => <pre className="bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>,
                                        blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-3 italic mb-2">{children}</blockquote>,
                                        a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                        table: ({ children }) => <table className="border-collapse border border-gray-300 mb-2 text-xs">{children}</table>,
                                        th: ({ children }) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold">{children}</th>,
                                        td: ({ children }) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
                                      }}
                                    >
                                      {message.content}
                                    </ReactMarkdown>
                                  )}
                                  
                                  {/* Sources Display for Assistant Messages */}
                                  {message.sources && message.sources.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-primary-200">
                                      <div className="text-xs font-medium text-primary-500 mb-2">Sources:</div>
                                      <div className="space-y-1">
                                        {message.sources.map((source, index) => {
                                          // Handle both string sources (legacy) and object sources (new format)
                                          let sourceUrl: string;
                                          let displayText: string;
                                          let pageNumber: number | undefined;
                                          
                                          if (typeof source === 'string') {
                                            // Legacy string format
                                            sourceUrl = source;
                                            const isUrl = source.startsWith('http://') || source.startsWith('https://');
                                            displayText = isUrl ? new URL(source).hostname : (source.split('.')[0] ?? source);
                                            pageNumber = undefined;
                                          } else {
                                            // New object format with filename and page
                                            sourceUrl = source.filename;
                                            const isUrl = source.filename.startsWith('http://') || source.filename.startsWith('https://');
                                            displayText = isUrl ? new URL(source.filename).hostname : (source.filename.split('.')[0] ?? source.filename);
                                            pageNumber = source.page ?? undefined;
                                          }
                                          
                                          const isUrl = sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://');
                                          
                                          return (
                                            <div key={index} className="flex items-center justify-between bg-primary-50 rounded-md px-3 py-2">
                                              <div className="flex items-center gap-2 flex-1 truncate">
                                                <span className="text-sm text-primary-600 truncate">{displayText}</span>
                                                {pageNumber && (
                                                  <span className="text-xs text-white px-2 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--main-yellow)' }}>
                                                    Page {pageNumber}
                                                  </span>
                                                )}
                                              </div>
                                              {isUrl ? (
                                                <a
                                                  href={sourceUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="ml-2 p-1 text-primary-500 hover:text-primary-700 hover:bg-primary-100 rounded transition-colors"
                                                  title={`Open ${sourceUrl}`}
                                                >
                                                  <ExternalLink className="w-4 h-4" />
                                                </a>
                                              ) : (
                                                <button
                                                  onClick={() => {
                                                    // Create a download link for the source document
                                                    const link = document.createElement('a');
                                                    link.href = `https://bonneragpage.omadligrouphq.com/files/download/${sourceUrl}`;
                                                    link.target = '_blank';
                                                    link.click();
                                                  }}
                                                  className="ml-2 p-1 text-primary-400 hover:text-primary-600 hover:bg-primary-100 rounded transition-colors"
                                                  title={`Download ${sourceUrl}`}
                                                >
                                                  <Download className="w-4 h-4" />
                                                </button>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  {formatDateTime(message.created_at)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryModal;