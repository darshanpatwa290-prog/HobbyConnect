import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MessageSquare,
  Sparkles,
  Users,
  Check,
  CheckCheck,
  RefreshCw,
  Hash,
} from 'lucide-react';
import { IConversation, IMessage, IUser } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface Props {
  initialUserId?: string | null;
  onSelectUser?: (userId: string | null) => void;
}

export const MessagesView: React.FC<Props> = ({ initialUserId, onSelectUser }) => {
  const { user, refreshCounters } = useAuth();
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId || null);
  const [targetUser, setTargetUser] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [hobbyTopic, setHobbyTopic] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversation sidebar
  const fetchConversations = async () => {
    try {
      const res = await api.getConversations();
      setConversations(res.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  };

  // Fetch message thread
  const fetchThread = async (userId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await api.getMessages(userId);
      setTargetUser(res.targetUser);
      setMessages(res.messages || []);
      if (!silent) {
        setTimeout(scrollToBottom, 100);
      }
      await refreshCounters();
    } catch (err) {
      console.error('Error fetching messages thread:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (initialUserId) {
      setSelectedUserId(initialUserId);
    }
  }, [initialUserId]);

  useEffect(() => {
    if (selectedUserId) {
      fetchThread(selectedUserId);
    } else {
      setTargetUser(null);
      setMessages([]);
    }
  }, [selectedUserId]);

  // Live polling every 3 seconds for active thread
  useEffect(() => {
    if (!selectedUserId || !user) return;
    const interval = setInterval(() => {
      fetchThread(selectedUserId, true);
      fetchConversations();
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedUserId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !selectedUserId || sending) return;

    setSending(true);
    const contentToSend = inputContent.trim();
    const topicToSend = hobbyTopic.trim() || undefined;
    setInputContent('');

    try {
      await api.sendMessage(selectedUserId, contentToSend, topicToSend);
      await fetchThread(selectedUserId, true);
      await fetchConversations();
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="p-14 text-center bg-white border border-gray-200 rounded-2xl card-shadow space-y-3">
        <MessageSquare className="w-10 h-10 text-gray-400 mx-auto" />
        <h3 className="text-lg font-bold text-gray-900">Sign In to Access Direct Messages</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Chat in real-time with connected hobbyists and exchange tips, updates, and plans.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-11rem)] min-h-[520px] bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col md:flex-row card-shadow">
      {/* Sidebar: Conversations */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col bg-gray-50/60">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-gray-900">Direct Messages</h3>
          </div>
          <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {conversations.length} Active
          </span>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loadingConv ? (
            <div className="p-8 text-center text-xs text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-indigo-600" />
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 space-y-2">
              <Users className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-medium text-gray-700">No active conversations yet.</p>
              <p className="text-[11px] text-gray-500">
                Connect with hobbyists in Discover to start a chat!
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedUserId === conv.contact._id;
              return (
                <button
                  key={conv.contact._id}
                  onClick={() => {
                    setSelectedUserId(conv.contact._id);
                    if (onSelectUser) onSelectUser(conv.contact._id);
                  }}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition cursor-pointer ${
                    isSelected
                      ? 'bg-white border-l-4 border-indigo-600 shadow-xs'
                      : 'hover:bg-gray-100/70'
                  }`}
                >
                  <img
                    src={conv.contact.avatar}
                    alt={conv.contact.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-gray-900 truncate">
                        {conv.contact.name}
                      </span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {conv.lastMessage.content}
                    </p>

                    {conv.lastMessage.hobbyContext && (
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                        #{conv.lastMessage.hobbyContext}
                      </span>
                    )}
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Thread Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUserId && targetUser ? (
          <>
            {/* Chat Header */}
            <div className="p-3.5 border-b border-gray-200 bg-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={targetUser.avatar}
                  alt={targetUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{targetUser.name}</h4>
                  <div className="text-[11px] text-gray-500 flex items-center gap-2">
                    <span>@{targetUser.username}</span>
                    <span>•</span>
                    <span>{targetUser.location}</span>
                  </div>
                </div>
              </div>

              {/* Target User Hobbies */}
              <div className="hidden sm:flex items-center gap-1.5">
                {targetUser.hobbies?.slice(0, 2).map((h, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium border border-gray-200/60"
                  >
                    {h.hobbyName}
                  </span>
                ))}
              </div>
            </div>

            {/* Messages Thread Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-gray-50/40">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-12 gap-2 text-gray-400 text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Loading message thread...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-sm text-gray-900">Start your conversation!</h5>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Say hello, share a project update, or plan your next practice session together.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender === user._id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-xs card-shadow'
                        }`}
                      >
                        {msg.hobbyContext && (
                          <div
                            className={`text-[10px] font-semibold mb-1 flex items-center gap-1 ${
                              isMine ? 'text-indigo-200' : 'text-indigo-600'
                            }`}
                          >
                            <Hash className="w-3 h-3" />
                            <span>{msg.hobbyContext}</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1 font-medium">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMine && (
                          <span>
                            {msg.read ? (
                              <CheckCheck className="w-3 h-3 text-emerald-600 inline" />
                            ) : (
                              <Check className="w-3 h-3 text-gray-400 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-200 bg-white space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                  <Hash className="w-3.5 h-3.5 text-indigo-600" />
                  Topic:
                </span>
                <select
                  value={hobbyTopic}
                  onChange={(e) => setHobbyTopic(e.target.value)}
                  className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="">General Discussion</option>
                  {targetUser.hobbies?.map((h, i) => (
                    <option key={i} value={h.hobbyName}>
                      {h.hobbyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message ${targetUser.name}...`}
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 transition placeholder:text-gray-400"
                />

                <button
                  type="submit"
                  disabled={!inputContent.trim() || sending}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  {sending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-gray-900">Select a Conversation</h4>
            <p className="text-xs text-gray-500 max-w-sm">
              Choose a contact from the sidebar or click "Direct Chat" on any connected friend from your network.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
