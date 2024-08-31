import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import api from "../services/api";

const Comment = ({ commentId, setCommentsCount }) => {
    const [commentLiked, setCommentLiked] = useState(null);

    const [comment, setComment] = useState({});
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [reply, setReply] = useState("");
    const [nestedComments, setNestedComments] = useState(null);
    const [showNestedComments, setShowNestedComments] = useState(false);

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        console.log("Comment use effect running")
        async function fetchComment() {
            try {
                const response = await api.get(`/comments/${commentId}`);
                setComment(response.data.comment);
            }
            catch(error) {
                console.error("Error fetching comment data:", error);
            }
        };

        async function fetchNestedComments() {
            if (showNestedComments && !nestedComments) {
                try {
                    const response = await api.get(`/comments/${commentId}/nested`);
                    setNestedComments(response.data.nestedComments);
                } 
                catch (error) {
                    console.error("Error fetching nested comments:", error);
                }
            }
        };

        const fetchLikeStatus = async () => {
            try {
                const response = await api.get(`/comments/${commentId}/liked`);
                const usersLiked = response.data.users.map(user => user.id);
                setCommentLiked(usersLiked.includes(userId));
            } 
            catch (error) {
                console.error("Error fetching like status:", error);
            }
        };

        fetchComment();
        fetchNestedComments();
        fetchLikeStatus();
    }, [showNestedComments, nestedComments, commentId, userId]);

    const handleLikeClick = async (e) => {
        e.stopPropagation();
        try {
            if (commentLiked) {
                await api.delete(`/comments/${commentId}/like`);
                const updatedComment = {...comment};
                updatedComment._count.likes--;
                setComment(updatedComment);
            } else {
                await api.post(`/comments/${commentId}/like`);
                const updatedComment = {...comment};
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

            const newNestedComments = [...(comment.nestedComments || []), response.data.comment]
            const updatedComment = { ...comment, 
                nestedComments: newNestedComments
            };
            setNestedComments(newNestedComments);
            setComment(updatedComment);
            setCommentsCount((prevCount) => prevCount + 1);
            setReply("");
            setShowReplyInput(false);
        } catch (error) {
            console.error("Error replying to comment:", error);
        }
    };

    const handleShowRepliesClick = () => {
        setShowNestedComments(!showNestedComments);
    };

    const formatTime = (dt) => {
        return formatDistanceToNow(new Date(dt), {addSuffix: true});
    };

    console.log(comment);
    console.log(nestedComments);

    return (
        <div key={commentId} className="comment bg-gray-100 p-4 rounded-lg mb-4">
            <div className="flex items-center">
                <img
                    src={comment.user?.profilePictureUrl}
                    className="w-[30px] h-[30px] object-cover rounded-full"
                    alt="Profile"
                />
                <span className="text-base text-gray-500">@{comment.user?.username}</span>
                <span className="px-2 text-base text-gray-500">&#x2022;</span>
                <span className="text-sm text-gray-500">
                    {comment?.createdAt && formatTime(comment?.createdAt)}
                </span>
                <button 
                    onClick={(e) => handleLikeClick(e)} 
                    className={`py-2 px-4 rounded-md font-semibold focus:outline-none ${commentLiked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                    {commentLiked ? 'Liked' : 'Like'}
                </button>
                <span className="text-sm text-gray-500">
                    {comment._count?.likes}
                </span>
            </div>
            <p className="text-gray-800 mt-3">{comment?.comment}</p>

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
            {comment._count?.nestedComments > 0 && (
                <button
                    onClick={handleShowRepliesClick}
                    className="text-blue-500 text-sm mt-2 hover:underline"
                >
                    {showNestedComments
                        ? `Hide replies (${comment._count?.nestedComments})`
                        : `Show replies (${comment._count?.nestedComments})`}
                </button>
            )}

            {/* Nested Comments */}
            {showNestedComments && nestedComments && (
                <div className="nested-comments ml-6 mt-4">
                    {nestedComments.map((nestedComment) => (
                        <Comment
                            key={nestedComment.id}
                            commentId={nestedComment.id}
                            setCommentsCount={setCommentsCount}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comment;
