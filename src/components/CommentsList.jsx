import { useEffect, useState } from "react";
import api from "../services/api";
import Comment from "../components/Comment";

const CommentsList = ({postId, setCommentsCount}) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchRootComments = async () => {
            try {
                const response = await api.get(`/posts/${postId}/comments`);
                setComments(response.data.comments);
            } 
            catch (error) {
                console.error("Error fetching root comments:", error);
            }
        };

        fetchRootComments();
    }, [postId, userId]);

    const handleNewCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/posts/${postId}/comment`, {
                comment: newComment,
            });
            setComments([...comments, response.data.comment]);
            setNewComment("");
            setCommentsCount((prevCount) => prevCount + 1);
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    console.log(comments);
    return (
        <>
            {/* Comment Section */}
            <div className="comments-section">
                <h2 className="text-2xl font-semibold mb-4">Comments</h2>
                <form onSubmit={handleCommentSubmit} className="mb-6">
                    <textarea
                        value={newComment}
                        onChange={handleNewCommentChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="Add a comment..."
                        required
                    />
                    <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                        Comment
                    </button>
                </form>

                <div className="comments-list">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <Comment
                                key={comment.id}
                                commentId={comment.id}
                                setCommentsCount={setCommentsCount}
                                siblings={comments}
                                setSiblings={setComments}
                            />
                        ))
                    ) : (
                        <p>No comments yet. Be the first to comment!</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default CommentsList;
