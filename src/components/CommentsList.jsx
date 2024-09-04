import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import Comment from "../components/Comment";

const CommentsList = ({postId, setCommentsCount}) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1); // Track the current page
    const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
    const limit = 10; // Number of posts per page

    const userId = localStorage.getItem("userId");

    const resetComments = useCallback(() => {
        // Clear posts when sourceId or type changes
        setComments([]);
        setPage(1);
        setHasMore(true);
    }, []);

    useEffect(() => {
        console.log("CommentsList: Reset useeffect running")
        resetComments();
    }, [resetComments]);

    useEffect(() => {
        const fetchRootComments = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/posts/${postId}/comments`, { params: { page, limit } });

                if (response.data.comments.length < limit) {
                    setHasMore(false); // No more users to load
                }

                setComments((prevComments) => [...prevComments, ...response.data.comments]);
            } 
            catch (error) {
                console.error("Error fetching root comments:", error);
            }
            finally {
                setTimeout( async () => {
                    setLoading(false);
                }, 1000)
            }
        };

        fetchRootComments();
    }, [postId, userId, page]);

    useEffect(() => {
        const handleScroll = () => {
          if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 && hasMore && !loading) {
            setPage(prevPage => prevPage + 1);
          }
        };
    
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loading]);

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
            {/* New Comment Section */}
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

                {/* Comments List */}
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
                    {loading && <p className="text-center text-gray-500">Loading more comments...</p>}
                </div>
            </div>
        </>
    );
};

export default CommentsList;
