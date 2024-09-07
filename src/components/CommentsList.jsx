import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import Comment from "../components/Comment";

const CommentsList = ({postId, setTotalCommentsCount}) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1); // Track the current page
    const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
    const [sortField, setSortField] = useState('createdAt'); // Default sort field (newest)
    const [sortOrder, setSortOrder] = useState('desc'); // Default sort order (descending)
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
    }, [resetComments, sortField, sortOrder]);

    useEffect(() => {
        const fetchRootComments = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/posts/${postId}/comments`, { params: { page, limit, sortField, sortOrder } });

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
    }, [postId, userId, page, sortField, sortOrder]);

    const handleSortChange = (e) => {
        setSortField(e.target.value);
      };
    
    const toggleSortOrder = () => {
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };

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
            setTotalCommentsCount((prevCount) => prevCount + 1);
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
                {/* Sort controls */}
                <div className="sort-container mb-4 flex items-center">
                    <div className="relative">
                        <select
                            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            value={sortField }
                            onChange={handleSortChange}
                        >
                            <option value="createdAt">New</option>
                            <option value="likes">Likes</option>
                            <option value="nestedComments">Replies</option>
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.5 7.5L10 2.5l4.5 5h-9zM5.5 12.5l4.5 5 4.5-5h-9z" />
                            </svg>
                        </div>
                        </div>

                        {/* Sort Order Button */}
                        <button
                        className='ml-2 flex items-center p-2 border border-gray-300 rounded hover:bg-gray-100 bg-white'
                        onClick={toggleSortOrder}
                        aria-label="Toggle sort order"
                        >
                        <span className="ml-1 text-sm text-gray-600">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                    </button>
                </div>
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <Comment
                                key={comment.id}
                                commentId={comment.id}
                                setTotalCommentsCount={setTotalCommentsCount}
                                siblings={comments}
                                setSiblings={setComments}
                                sortField={sortField}
                                sortOrder={sortOrder}
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
