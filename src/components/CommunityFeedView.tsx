import React, { useState, useEffect } from 'react';

import {
  Flame,
  Plus,
  Heart,
  MessageCircle,
  Sparkles,
  Send,
  RefreshCw,
  X,
} from 'lucide-react';

import { IPost, IHobby } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface Props {
  onOpenAuth: () => void;
  onSelectUserForChat: (userId: string) => void;
}

export const CommunityFeedView: React.FC<Props> = ({
  onOpenAuth,
  onSelectUserForChat,
}) => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<IPost[]>([]);
  const [hobbies, setHobbies] = useState<IHobby[]>([]);
  const [selectedHobbyFilter, setSelectedHobbyFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // New Post Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postHobby, setPostHobby] = useState('');
  const [postImage, setPostImage] = useState('');
  const [postTags, setPostTags] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Active comments accordion
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPostsAndHobbies = async () => {
    setLoading(true);

    try {
      const [postsRes, hobbiesRes] = await Promise.all([
        api.getPosts({
          hobby:
            selectedHobbyFilter !== 'All'
              ? selectedHobbyFilter
              : undefined,
        }),
        api.getHobbies(),
      ]);

      setPosts(postsRes.posts || []);
      setHobbies(hobbiesRes.hobbies || []);

      if (hobbiesRes.hobbies?.length && !postHobby) {
        setPostHobby(hobbiesRes.hobbies[0].name);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndHobbies();
  }, [selectedHobbyFilter, user]);

  const handleLike = async (postId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    try {
      const res = await api.likePost(postId);

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                hasLiked: res.hasLiked,
                likesCount: res.likesCount,
              }
            : p
        )
      );
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleCommentSubmit = async (
    e: React.FormEvent,
    postId: string
  ) => {
    e.preventDefault();

    if (!user) {
      onOpenAuth();
      return;
    }

    const text = commentInputs[postId]?.trim();

    if (!text) return;

    setSubmittingComment(true);

    try {
      const res = await api.commentPost(postId, text);

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                comments: res.comments,
              }
            : p
        )
      );

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: '',
      }));
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!postTitle.trim() || !postContent.trim() || !postHobby) {
      return;
    }

    setSubmittingPost(true);

    try {
      const tags = postTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await api.createPost({
        title: postTitle.trim(),
        content: postContent.trim(),
        hobbyName: postHobby,
        imageUrl: postImage.trim() || undefined,
        tags: tags.length ? tags : undefined,
      });

      setShowCreateModal(false);
      setPostTitle('');
      setPostContent('');
      setPostImage('');
      setPostTags('');

      await fetchPostsAndHobbies();
    } catch (err) {
      console.error('Create post error:', err);
    } finally {
      setSubmittingPost(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Community Moments & Discussions
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Share creations, equipment tips, project logs, or call out for
            practice buddies.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              onOpenAuth();
            } else {
              setShowCreateModal(true);
            }
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Share Hobby Moment
        </button>
      </div>

      {/* Hobby Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedHobbyFilter('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            selectedHobbyFilter === 'All'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          All Topics
        </button>

        {hobbies.map((h) => (
          <button
            key={h._id}
            onClick={() => setSelectedHobbyFilter(h.name)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedHobbyFilter === h.name
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {h.name}
          </button>
        ))}
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />

          <span className="text-xs font-medium">
            Loading community moments...
          </span>
        </div>
      ) : posts.filter((post) => post.author !== null).length === 0 ? (
        <div className="p-14 text-center bg-white rounded-2xl border border-gray-200 card-shadow space-y-2">
          <Flame className="w-8 h-8 text-gray-400 mx-auto" />

          <h3 className="text-base font-bold text-gray-900">
            No posts in this category yet
          </h3>

          <p className="text-xs text-gray-500">
            Be the first to share an update with the community!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {posts
            .filter((post) => post.author !== null)
            .map((post) => {
              const isCommentsOpen = expandedPostId === post._id;

              return (
                <article
                  key={post._id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-4 card-shadow"
                >
                  {/* Author row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          post.author?.avatar ||
                          'https://ui-avatars.com/api/?name=Community+Member'
                        }
                        alt={post.author?.name || 'Community Member'}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />

                      <div>
                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <span>
                            {post.author?.name || 'Community Member'}
                          </span>

                          <span className="text-xs text-gray-400 font-normal">
                            @{post.author?.username || 'community_member'}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500">
                          {post.author?.location || 'Everywhere'} •{' '}
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold">
                      {post.hobbyName}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-gray-900">
                      {post.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Attached Image */}
                  {post.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-gray-200 max-h-96 bg-gray-50">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Reactions */}
                  <div className="flex items-center gap-6 pt-3 border-t border-gray-100 text-xs">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 transition cursor-pointer ${
                        post.hasLiked
                          ? 'text-rose-600 font-semibold'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          post.hasLiked
                            ? 'fill-rose-500 text-rose-500'
                            : ''
                        }`}
                      />

                      <span>{post.likesCount || 0} Likes</span>
                    </button>

                    <button
                      onClick={() =>
                        setExpandedPostId(
                          isCommentsOpen ? null : post._id
                        )
                      }
                      className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />

                      <span>
                        {post.comments?.length || 0} Comments
                      </span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {isCommentsOpen && (
                    <div className="pt-3 border-t border-gray-100 space-y-3">
                      <div className="space-y-2">
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((comment) => (
                            <div
                              key={comment._id}
                              className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-gray-900">
                                  {comment.authorName}
                                </span>

                                <span className="text-[10px] text-gray-400">
                                  {new Date(
                                    comment.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>

                              <p className="text-xs text-gray-700">
                                {comment.content}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 italic py-1">
                            No comments yet.
                          </p>
                        )}
                      </div>

                      {/* New Comment Input */}
                      <form
                        onSubmit={(e) =>
                          handleCommentSubmit(e, post._id)
                        }
                        className="flex items-center gap-2 pt-1"
                      >
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputs[post._id] || ''}
                          onChange={(e) =>
                            setCommentInputs({
                              ...commentInputs,
                              [post._id]: e.target.value,
                            })
                          }
                          className="flex-1 px-3.5 py-2 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-indigo-600"
                        />

                        <button
                          type="submit"
                          disabled={
                            submittingComment ||
                            !commentInputs[post._id]?.trim()
                          }
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  )}
                </article>
              );
            })}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                Share Hobby Moment
              </h3>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreatePost}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Hobby *
                </label>

                <select
                  value={postHobby}
                  onChange={(e) => setPostHobby(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
                >
                  {hobbies.map((h) => (
                    <option key={h._id} value={h.name}>
                      {h.name} ({h.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Title *
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Conquered my first V7 overhang! or New V60 brew recipe"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Details & Story *
                </label>

                <textarea
                  rows={4}
                  required
                  placeholder="Share details, techniques, lessons learned, or what partners you're looking for..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Image URL (Optional)
                </label>

                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={postImage}
                  onChange={(e) => setPostImage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tags (comma separated)
                </label>

                <input
                  type="text"
                  placeholder="e.g. Technique, Beta, Project"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer"
                >
                  {submittingPost ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Publish Post</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};