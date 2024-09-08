import { useEffect, useState } from "react";
import api from "../services/api";
import ImageViewer from "../components/modals/ImageViewer";
import { useNavigate, useParams } from "react-router-dom";
import CommentsList from "../components/CommentsList";
import { formatTime } from "../utils/formatters";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";

const PostPage = () => {
    const navigate = useNavigate();
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [commentsCount, setCommentsCount] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [liked, setLiked] = useState(null);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/posts/${postId}`);
                setPost(response.data.post);
            } 
            catch (error) {
                console.error("Error fetching post:", error);
            }
        };
        const fetchLikeStatus = async () => {
            try {
                const response = await api.get(`/posts/${postId}/liked`);
                const usersLiked = response.data.users.map(user => user.id);
                setLiked(usersLiked.includes(userId));
            } 
            catch (error) {
                console.error("Error fetching like status:", error);
            }
        };
        const getPostCommentsCount = async () => {
            try {
                const response = await api.get(`/posts/${postId}/comments/count`);
                setCommentsCount(response.data.count);
            } 
            catch (error) {
                console.error("Error fetching comment count:", error);
            }
        }

        fetchPost();
        fetchLikeStatus();
        getPostCommentsCount();
    }, [postId, userId]);

    const handleImageClick = (e, imageUrl) => {
        e.stopPropagation();
        setSelectedImage(imageUrl);
    };

    const closeImage = () => {
        setSelectedImage(null);
    };

    const handleLikeClick = async () => {
        try {
            if (liked) {
                await api.delete(`/posts/${postId}/like`);
            } else {
                await api.post(`/posts/${postId}/like`);
            }
            setLiked(!liked);
            const updatedPost = { ...post };
            updatedPost._count.likes += liked ? -1 : 1;
            setPost(updatedPost);
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        navigate(`/submit-post/${postId}`);
    };

    const redirectToProfile = (e, authorId) => {
        e.stopPropagation();
        navigate(`/profile/${authorId}`);
    };

    const redirectToRealm = (e, realmId) => {
        e.stopPropagation();
        navigate(`/realms/${realmId}`);
    };

    return (
        <div className="container mx-auto pr-6 bg-gray-900 text-gray-100 min-h-screen">
            {post && (
                <div className="post-item bg-gray-800 p-6 rounded-lg shadow-md mb-6 relative">
                    {/* Author Section */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <img 
                                src={post?.author?.profilePictureUrl} 
                                alt={`${post?.author?.username}'s profile`} 
                                className="w-12 h-12 rounded-full object-cover cursor-pointer" 
                                onClick={(e) => redirectToProfile(e, post?.authorId)}
                            />
                            <div>
                                <h3 
                                    className="text-lg font-semibold text-blue-400 cursor-pointer hover:underline"
                                    onClick={(e) => redirectToProfile(e, post?.authorId)}
                                >
                                    @{post?.author?.username}
                                </h3>
                                <div className="flex items-center">
                                    <p className="text-sm text-gray-400">
                                        {post?.createdAt && formatTime(post?.createdAt)} on
                                    </p>
                                    <div className="flex items-center ml-2">
                                        <img 
                                            src={post?.realm?.realmPictureUrl} 
                                            alt={`${post?.realm?.name} realm picture`} 
                                            className="w-6 h-6 rounded-lg object-cover cursor-pointer"
                                            onClick={(e) => redirectToRealm(e, post?.realmId)}
                                        />
                                        <span 
                                            className="ml-1 text-sm font-semibold cursor-pointer hover:underline"
                                            onClick={(e) => redirectToRealm(e, post?.realmId)}
                                        >
                                            {post?.realm?.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {userId === post?.authorId && (
                            <div className="space-x-4">
                                <button onClick={(e) => handleEditClick(e)} className="text-blue-400 hover:underline">
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                        <h1 className="text-3xl font-semibold mb-2">{post.title}</h1>
                        {post.text && <p className="text-gray-300 mb-4">{post.text}</p>}
                        {post.images && post.images.length > 0 && (
                            <div className="flex flex-wrap gap-4 mb-4">
                                {post.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image.url}
                                        alt={`Post Image ${index + 1}`}
                                        className="w-32 h-32 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity duration-200"
                                        onClick={(e) => handleImageClick(e, image.url)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Post Meta */}
                    <div className="post-meta text-gray-400 flex items-center space-x-6">
                        <span className="flex items-center space-x-1">
                            <FontAwesomeIcon 
                                onClick={(e) => handleLikeClick(e)} 
                                icon={liked ? faHeartSolid : faHeartRegular} 
                                className={`text-xl cursor-pointer ${liked ? 'text-red-500' : 'text-gray-400'}`} 
                            />
                            <span className="ml-1">{post._count.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <FontAwesomeIcon icon={faComment} className="text-xl" />
                            <span className="ml-1">{commentsCount}</span>
                        </span>
                    </div>
                </div>
            )}
            {selectedImage && (
                <ImageViewer
                    imageUrl={selectedImage}
                    onClose={closeImage}
                />
            )}
            {post && <CommentsList postId={postId} setTotalCommentsCount={setCommentsCount} />}
        </div>
    );
};

export default PostPage;
