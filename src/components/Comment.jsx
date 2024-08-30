import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import api from "../services/api";

const Comment = ({ comment, setComments, setCommentsCount }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [reply, setReply] = useState("");
    const [nestedComments, setNestedComments] = useState(null);
    const [showNestedComments, setShowNestedComments] = useState(false);

    useEffect(() => {
        async function fetchNestedComments() {
            if (showNestedComments && !nestedComments) {
                try {
                    const response = await api.get(`/comments/${comment.id}/nested`);
                    setNestedComments(response.data.nestedComments);
                } catch (error) {
                    console.error("Error fetching nested comments:", error);
                }
            }
        }
        fetchNestedComments();
    }, [showNestedComments, nestedComments, comment.id]);

    const handleReplyClick = () => {
        setShowReplyInput(!showReplyInput);
    };

    const handleReplyChange = (e) => {
        setReply(e.target.value);
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/comments/${comment.id}/nested`, {
                postId: comment.postId,
                comment: reply,
            });
            setComments((prevComments) =>
                prevComments.map((c) =>
                    c.id === comment.id
                        ? { ...c, nestedComments: [...(c.nestedComments || []), response.data.comment] }
                        : c
                )
            );
            setReply("");
            setShowReplyInput(false);
            setCommentsCount((prevCount) => prevCount + 1);
        } catch (error) {
            console.error("Error replying to comment:", error);
        }
    };

    const handleShowRepliesClick = () => {
        setShowNestedComments(!showNestedComments);
    };

    return (
        <div key={comment.id} className="comment bg-gray-100 p-4 rounded-lg mb-4">
            <div className="flex items-center">
                <img
                    src={comment.user.profilePictureUrl}
                    className="w-[30px] h-[30px] object-cover rounded-full"
                    alt="Profile"
                />
                <span className="text-base text-gray-500">@{comment.user.username}</span>
                <span className="px-2 text-base text-gray-500">&#x2022;</span>
                <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
            </div>
            <p className="text-gray-800 mt-3">{comment.comment}</p>

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
            {comment._count.nestedComments > 0 && (
                <button
                    onClick={handleShowRepliesClick}
                    className="text-blue-500 text-sm mt-2 hover:underline"
                >
                    {showNestedComments
                        ? `Hide replies (${comment._count.nestedComments})`
                        : `Show replies (${comment._count.nestedComments})`}
                </button>
            )}

            {/* Nested Comments */}
            {showNestedComments && nestedComments && (
                <div className="nested-comments ml-6 mt-4">
                    {nestedComments.map((nestedComment) => (
                        <Comment
                            key={nestedComment.id}
                            comment={nestedComment}
                            setComments={setComments}
                            setCommentsCount={setCommentsCount}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comment;
