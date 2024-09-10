import { useCallback, useEffect, useState } from "react";
import { formatTime } from "../utils/formatters";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faHeart as faHeartFilled, faEllipsis, faPenToSquare, faTrashCan, faReply } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

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
    const [nestedLoading, setNestedLoading] = useState(false);
    const [page, setPage] = useState(1); // Track the current page
    const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
    const limit = 5; // Number of comments per page
    const [editMode, setEditMode] = useState(false);
    const [editedComment, setEditedComment] = useState(comment.comment);

    const userId = localStorage.getItem("userId");
    const isCreator = userId === comment?.userId;

    // Fetch main comment data
    useEffect(() => {
        setLoading(true);
        async function fetchComment() {
            try {
                const response = await api.get(`/comments/${commentId}`);
                setComment(response.data.comment);
                setNestedCommentsCount(response.data.comment._count?.nestedComments);
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
            finally {
                setLoading(false)
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
        resetNestedComments();
    }, [resetNestedComments]);

    // Fetch nested comments with pagination
    useEffect(() => {
        async function fetchNestedComments() {
            try {
                setNestedLoading(true);
                const response = await api.get(`/comments/${commentId}/nested`, {
                    params: { page, limit, sortField, sortOrder },
                });
                if (response.data.nestedComments.length < limit) {
                    setHasMore(false); // No more nested comments to load
                }
                setNestedComments(prev => [...prev || [], ...response.data.nestedComments]);
            } catch (error) {
                console.error("Error fetching nested comments:", error);
            } finally {
                setNestedLoading(false);
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevents adding a new line
            handleReplySubmit(e); // Triggers form submission
        }
    };

    const handleShowRepliesClick = () => {
        setShowNestedComments(!showNestedComments);
    };

    const handleLoadMoreNestedComments = () => {
        if (hasMore && !nestedLoading) {
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
            return response.data.count;
        } catch (error) {
            console.error("Error fetching comment nested count:", error);
        }
    }

    const handleDeleteClick = async () => {
        try {
            const totalCommentsToRemove = await fetchFullNestedCount() + 1;

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

    return (
        <div key={commentId} className="flex-1 comment text-white py-4 pl-2 border-b border-gray-700">
            {loading 
            ? 
                <div className="flex justify-center items-center h-full">
                    <div className="w-16 h-16 border-t-4 border-indigo-600 border-solid rounded-full animate-spin p-6"></div>
                </div>
            :
            <>
                <div className="flex items-center">
                    <div className="flex flex-1 items-center space-x-2 cursor-pointer" onClick={() => navigate(`/profile/${comment.user?.id}`)}>
                        <img
                            src={comment.user?.profilePictureUrl}
                            className="w-10 h-10 object-cover rounded-full"
                            alt="Profile"
                        />
                        <div>
                            <div className="text-base font-semibold text-blue-400 hover:underline">@{comment.user?.username}</div>
                            <div className="text-sm text-gray-400 flex-1">
                                {comment?.createdAt && formatTime(comment?.createdAt)}
                            </div>
                        </div>
                    </div>
                    
                    {comment?.updatedAt && comment?.createdAt !== comment?.updatedAt && (
                        <span className="text-xs text-gray-400 mr-2">
                            &#40;Edited&#41;	
                        </span>
                    )}
                    <span className="flex items-center space-x-1">
                        <FontAwesomeIcon 
                                onClick={(e) => handleLikeClick(e)} 
                                icon={commentLiked ? faHeartFilled : faHeart} 
                                className={`cursor-pointer text-xl ${commentLiked ? 'text-red-500' : 'text-gray-400'}`} 
                            />
                        <span className="text-sm text-gray-400 cursor-pointer ml-2" onClick={() => navigate(`/comments/${comment?.id}/liked`)}>
                            {comment._count?.likes}
                        </span>
                    </span>
                        <div className="flex items-center px-3 text-gray-400">
                            <Menu as="div" className="relative">
                                <MenuButton>
                                    <FontAwesomeIcon icon={faEllipsis} className="hover:text-gray-300"/>
                                </MenuButton>
                                <MenuItems className="absolute right-0 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-md w-40">
                                    <MenuItem>
                                        <button
                                            onClick={handleReplyClick}
                                            className='pl-6 text-left space-x-3 w-full py-2 text-sm hover:bg-gray-600'
                                        >
                                            <FontAwesomeIcon icon={faReply} />
                                            <span>Reply</span>
                                        </button>
                                </MenuItem>
                                    {isCreator &&
                                        <>
                                        <MenuItem>
                                                <button
                                                    onClick={handleEditClick}
                                                    className='pl-6 text-left space-x-3 w-full py-2 text-sm hover:bg-gray-600'
                                                >
                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                    <span>Edit</span>
                                                </button>
                                        </MenuItem>
                                        <MenuItem>
                                                <button
                                                    onClick={handleDeleteClick}
                                                    className='pl-6 text-left space-x-3 w-full py-2 text-sm hover:bg-gray-600'
                                                >
                                                    <FontAwesomeIcon icon={faTrashCan} />
                                                    <span>Delete</span>
                                                </button>
                                        </MenuItem>
                                        </>
                                    }
                                </MenuItems>
                            </Menu>
                        </div>
                </div>
        
                {editMode ? (
                    <form onSubmit={handleEditSubmit} className="mt-2">
                        <textarea
                            value={editedComment}
                            onChange={handleEditChange}
                            className="w-full p-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-md"
                            placeholder="Edit your comment..."
                            required
                        />
                        <div className="flex mt-2 space-x-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-gray-300 mt-3 overflow-hidden text-ellipsis overflow-wrap-break-word break-all">{comment?.comment}</p>
                )}
        
                {/* Reply Button */}
                <div>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleReplyClick}
                            className="text-blue-400 text-sm mt-2 space-x-2 hover:underline"
                        >
                            <FontAwesomeIcon icon={faReply} className="text-xs"/>
                            <span>Reply</span>
                        </button>
                        {/* Show Replies Button */}
                        {nestedCommentsCount > 0 && (
                            <button
                                onClick={handleShowRepliesClick}
                                className="text-blue-400 text-sm mt-2 hover:underline"
                            >
                                {showNestedComments
                                    ? `Hide replies`
                                    : `Show ${nestedCommentsCount} replies`}
                            </button>
                        )}
                    </div>
                    {/* Reply Input */}
                    {showReplyInput && (
                        <form onSubmit={handleReplySubmit} className="mt-2 flex items-center space-x-2">
                            <textarea
                                value={reply}
                                onChange={handleReplyChange}
                                onKeyDown={handleKeyDown}
                                className="flex-1 bg-gray-700 text-gray-300 p-2 border border-gray-600 rounded-lg"
                                placeholder={`Reply to @${comment.user?.username}`}
                                required
                                rows="1"
                            />
                            <button
                                type="submit"
                                className="ml-4 flex items-center p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-300 hover:bg-blue-600 transition"
                            >
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </form>
                    )}
                </div>
        
                {/* Nested Comments */}
                {showNestedComments && nestedComments && (
                    <div className="flex-1">
                        {nestedComments.map((nestedComment) => (
                            <div className="nested-comments ml-3 mt-2 flex" key={nestedComment.id}>
                                <div className="mt-2">
                                    <div className="w-2 h-5 border-l border-b border-gray-500">
                                    </div>
                                </div>
                                <Comment
                                    commentId={nestedComment.id}
                                    setTotalCommentsCount={setTotalCommentsCount}
                                    siblings={nestedComments}
                                    setSiblings={setNestedComments}
                                    sortField={sortField}
                                    sortOrder={sortOrder}
                                    setParentNestedCount={setNestedCommentsCount}
                                />
                            </div>
                        ))}
        
                        {/* Load More Replies Button */}
                        {hasMore && !nestedLoading && (
                            <button
                                onClick={handleLoadMoreNestedComments}
                                className="text-blue-400 text-sm mt-4 hover:underline"
                            >
                                Load more replies
                            </button>
                        )}
        
                        {/* Loading Indicator */}
                        {nestedLoading && (
                            <div className="flex justify-center items-center h-full">
                                <div className="w-16 h-16 border-t-4 border-indigo-600 border-solid rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                )}
                </>
            }
        </div>
    );    
};

export default Comment;