import { useCallback, useEffect, useState } from "react";
import { formatTime } from "../utils/formatters";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const Comment = ({ commentId, setTotalCommentsCount, siblings, setSiblings, sortField, sortOrder, setParentNestedCount }) => {
    const navigate = useNavigate();
    const [comment, setComment] = useState({});
    const [commentLiked, setCommentLiked] = useState(null);

    const [showReplyInput, setShowReplyInput] = useState(false);
    const [reply, setReply] = useState("");

    const [nestedComments, setNestedComments] = useState(null);
    const [showNestedComments, setShowNestedComments] = useState(false);
    const [nestedCommentsCount, setNestedCommentsCount] = useState(0);

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1); // Track the current page
    const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
    const limit = 5; // Number of comments per page

    const [editMode, setEditMode] = useState(false);
    const [editedComment, setEditedComment] = useState(comment.comment);

    const userId = localStorage.getItem("userId");
    const isCreator = userId === comment?.userId;

    // Fetch main comment data
    useEffect(() => {
        async function fetchComment() {
            try {
                const response = await api.get(`/comments/${commentId}`);
                setComment(response.data.comment);
                setNestedCommentsCount(response.data.comment._count?.nestedComments)
            } catch (error) {
                console.error("Error fetching comment data:", error);
            }
        }

        const fetchLikeStatus = async () => {
            try {
                const response = await api.get(`/comments/${commentId}/liked`);
                const usersLiked = response.data.users.map(user => user.id);
                setCommentLiked(usersLiked.includes(userId));
            } catch (error) {
                console.error("Error fetching like status:", error);
            }
        };

        fetchComment();
        fetchLikeStatus();
    }, [commentId, userId]);

    const resetNestedComments = useCallback(() => {
        setNestedComments(null);
        setPage(1);
        setHasMore(true);
    }, []);

    useEffect(() => {
        console.log("NestedComments: Reset useeffect running")
        resetNestedComments();
    }, [resetNestedComments]);

    // Fetch nested comments with pagination
    useEffect(() => {
        console.log("Nested fetch use effect running")
        async function fetchNestedComments() {
            try {
                setLoading(true);
                const response = await api.get(`/comments/${commentId}/nested`, {
                    params: { page, limit, sortField, sortOrder },
                });
                console.log(response);
                if (response.data.nestedComments.length < limit) {
                    setHasMore(false); // No more nested comments to load
                }
                setNestedComments(prev => [...prev || [], ...response.data.nestedComments]);
            } catch (error) {
                console.error("Error fetching nested comments:", error);
            } finally {
                setLoading(false);
            }
        }
            fetchNestedComments();
    }, [page, commentId, sortField, sortOrder]);

    const handleLikeClick = async (e) => {
        e.stopPropagation();
        try {
            if (commentLiked) {
                await api.delete(`/comments/${commentId}/like`);
                const updatedComment = { ...comment };
                updatedComment._count.likes--;
                setComment(updatedComment);
            } else {
                await api.post(`/comments/${commentId}/like`);
                const updatedComment = { ...comment };
                updatedComment._count.likes++;
                setComment(updatedComment);
            }
            setCommentLiked(prevLiked => !prevLiked);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleReplyClick = () => {
        setShowReplyInput(!showReplyInput);
    };

    const handleReplyChange = (e) => {
        setReply(e.target.value);
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/comments/${commentId}/nested`, {
                postId: comment.postId,
                comment: reply,
            });

            // Update states
            setNestedComments(prevNestedComments => [...prevNestedComments || [], response.data.comment]);

            // Increment counts
            if (setParentNestedCount) setParentNestedCount(prev => prev + 1);
            setNestedCommentsCount(prev => prev + 1);
            setTotalCommentsCount(prev => prev + 1);

            // Reset reply state
            setReply("");
            setShowReplyInput(false);
            setShowNestedComments(true);
        } catch (error) {
            console.error("Error replying to comment:", error);
        }
    };

    const handleShowRepliesClick = () => {
        setShowNestedComments(!showNestedComments);
    };

    const handleLoadMoreNestedComments = () => {
        if (hasMore && !loading) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handleEditClick = () => {
        setEditMode(true);
        setEditedComment(comment.comment);
    };

    const handleEditChange = (e) => {
        setEditedComment(e.target.value);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/comments/${commentId}`, {
                comment: editedComment,
            });
            setComment(response.data.comment);
            setEditMode(false);
        } catch (error) {
            console.error("Error editing comment:", error);
        }
    };

    async function fetchFullNestedCount() {
        try {
            const response = await api.get(`/comments/${commentId}/nested/count`);
            console.log(response.data.count);
            return response.data.count;
        } catch (error) {
            console.error("Error fetching comment nested count:", error);
        }
    }

    const handleDeleteClick = async () => {
        try {
            const totalCommentsToRemove = await fetchFullNestedCount() + 1;
            console.log("Deleting", totalCommentsToRemove + 1);

            // Update parent's nestedComments state
            setSiblings(siblings.filter((comment) => comment.id !== commentId));

            // Update the parent nested comment count, if not root
            if (setParentNestedCount) setParentNestedCount(prev => prev - totalCommentsToRemove);
            setTotalCommentsCount(prev => prev - totalCommentsToRemove);

            // Finally, delete comment from db
            await api.delete(`/comments/${commentId}`);
            
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };
    
    console.log(comment);
    console.log(nestedCommentsCount);
    console.log(nestedComments);

    return (
        <div key={commentId} className="comment bg-gray-100 p-4 rounded-lg mb-4">
            <div className="flex items-center">
                <div className="flex items-center cursor-pointer hover:underline" onClick={() => navigate(`/profile/${comment.user?.id}`)}>
                    <img
                        src={comment.user?.profilePictureUrl}
                        className="w-[30px] h-[30px] object-cover rounded-full"
                        alt="Profile"
                    />
                    <span className="text-base text-gray-500">@{comment.user?.username}</span>
                </div>
                <span className="px-2 text-base text-gray-500">&#x2022;</span>
                <span className="text-sm text-gray-500">
                    {comment?.createdAt && formatTime(comment?.createdAt)}
                </span>
                {comment?.updatedAt && comment?.createdAt !== comment?.updatedAt && (
                    <span className="text-sm text-gray-500 ml-2">
                        (Edited {formatTime(comment?.updatedAt)})
                    </span>
                )}
                <button
                    onClick={(e) => handleLikeClick(e)}
                    className={`py-2 px-4 rounded-md font-semibold focus:outline-none ${commentLiked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                    {commentLiked ? 'Liked' : 'Like'}
                </button>
                <span className="text-sm text-gray-500 cursor-pointer" onClick={() => navigate(`/comments/${comment?.id}/liked`)}>
                    {comment._count?.likes}
                </span>
            </div>
    
            {editMode ? (
                <form onSubmit={handleEditSubmit} className="mt-2">
                    <textarea
                        value={editedComment}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="Edit your comment..."
                        required
                    />
                    <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-md"
                    >
                        Cancel
                    </button>
                </form>
            ) : (
                <p className="text-gray-800 mt-3">{comment?.comment}</p>
            )}
    
            {isCreator &&
                <div className="flex space-x-2">
                    <button
                        onClick={handleEditClick}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm"
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="px-4 py-2 bg-red-500 text-white rounded-md text-sm"
                    >
                        Delete
                    </button>
                </div>
            }
    
            {/* Reply Button */}
            <button
                onClick={handleReplyClick}
                className="text-blue-500 text-sm mt-2 hover:underline"
            >
                Reply
            </button>
    
            {/* Reply Input */}
            {showReplyInput && (
                <form onSubmit={handleReplySubmit} className="mt-2">
                    <textarea
                        value={reply}
                        onChange={handleReplyChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="Write your reply..."
                        required
                    />
                    <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                        Reply
                    </button>
                </form>
            )}
    
            {/* Show Replies Button */}
            {nestedCommentsCount > 0 && (
                <button
                    onClick={handleShowRepliesClick}
                    className="text-blue-500 text-sm mt-2 hover:underline"
                >
                    {showNestedComments
                        ? `Hide replies`
                        : `Show ${nestedCommentsCount} replies`}
                </button>
            )}
    
            {/* Nested Comments */}
            {showNestedComments && nestedComments && (
                <div className="nested-comments ml-6 mt-4">
                    {nestedComments.map((nestedComment) => (
                        <Comment
                            key={nestedComment.id}
                            commentId={nestedComment.id}
                            setTotalCommentsCount={setTotalCommentsCount}
                            siblings={nestedComments}
                            setSiblings={setNestedComments}
                            sortField={sortField}
                            sortOrder={sortOrder}
                            setParentNestedCount={setNestedCommentsCount}
                        />
                    ))}
    
                    {/* Load More Replies Button */}
                    {hasMore && !loading && (
                        <button
                            onClick={handleLoadMoreNestedComments}
                            className="text-blue-500 text-sm mt-4 hover:underline"
                        >
                            Load more replies
                        </button>
                    )}
    
                    {/* Loading Indicator */}
                    {loading && (
                        <p className="text-gray-500 text-sm mt-2">Loading more replies...</p>
                    )}
                </div>
            )}
        </div>
    );    
};

export default Comment;
