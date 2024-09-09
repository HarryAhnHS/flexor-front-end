import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import Comment from "../components/Comment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const CommentsList = ({ postId, setTotalCommentsCount }) => {
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
        resetComments();
    }, [resetComments, sortField, sortOrder]);

    useEffect(() => {
        const fetchRootComments = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/posts/${postId}/comments`, { params: { page, limit, sortField, sortOrder } });

                if (response.data.comments.length < limit) {
                    setHasMore(false); // No more comments to load
                }

                setComments((prevComments) => [...prevComments, ...response.data.comments]);
            } catch (error) {
                console.error("Error fetching root comments:", error);
            } finally {
                setLoading(false);
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevents adding a new line
            handleCommentSubmit(e); // Triggers form submission
        }
    };

    return (
        <>
            {/* New Comment Section */}
            <div className="comments-section text-white rounded-lg ">
                <h2 className="text-2xl font-semibold mb-4">Comments</h2>
                <form onSubmit={handleCommentSubmit} className="mb-6 flex items-center space-x-2">
                    <textarea
                        value={newComment}
                        onChange={handleNewCommentChange}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-gray-800 text-gray-300 p-2 border border-gray-700 rounded-lg"
                        placeholder="Add a comment..."
                        required
                        rows="1"
                    />
                    <button
                        type="submit"
                        className="ml-4 flex items-center p-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-300 hover:bg-blue-600 transition"
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </form>

                {/* Comments List */}
                <div className="comments-list">
                    {/* Sort controls */}
                    <div className="sort-container mb-4 flex items-center space-x-2">
                        <div className="relative">
                            <select
                                className="block w-full bg-gray-800 border border-gray-700 text-gray-300 py-2 px-4 pr-8 rounded-lg appearance-none focus:outline-none"
                                value={sortField}
                                onChange={handleSortChange}
                            >
                                <option value="createdAt">New</option>
                                <option value="likes">Likes</option>
                                <option value="nestedComments">Replies</option>
                            </select>
                            <div className="text-sm pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5.5 7.5L10 2.5l4.5 5h-9zM5.5 12.5l4.5 5 4.5-5h-9z" />
                                </svg>
                            </div>
                        </div>

                        {/* Sort Order Button */}
                        <button
                            className='ml-2 flex items-center p-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-600 transition'
                            onClick={toggleSortOrder}
                            aria-label="Toggle sort order"
                        >
                            <span className="text-sm">{sortOrder === 'asc' ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown}/>} </span>
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
                        <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                    )}
                    {loading && 
                        <div className="flex justify-center items-center h-full">
                            <div className="w-16 h-16 border-t-4 border-indigo-600 border-solid rounded-full animate-spin"></div>
                        </div>
                    }
                </div>
            </div>
        </>
    );
};

export default CommentsList;
