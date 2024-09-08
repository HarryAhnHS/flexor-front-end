import { useEffect, useState } from "react";
import api from "../services/api";
import ImageViewer from "../components/modals/ImageViewer";
import { useNavigate } from "react-router-dom";
import { formatTime } from '../utils/formatters';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartFilled } from "@fortawesome/free-solid-svg-icons";

const PostPreview = ({ postId, isEditable, posts, setPosts }) => {
    const [post, setPost] = useState(null);
    const [liked, setLiked] = useState(false);
    const [commentsCount, setCommentsCount] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/posts/${postId}`);
                setPost(response.data.post);
            } catch (error) {
                console.error('Error getting post', error);
            }
        };

        const fetchLikedState = async () => {
            try {
                const response = await api.get(`/posts/${postId}/liked`);
                const usersLiked = response.data.users.map(user => user.id);
                setLiked(usersLiked.includes(userId));
            } catch (error) {
                console.error('Error getting liked user Ids:', error);
            }
        };

        const fetchPostCommentsCount = async () => {
            try {
                const response = await api.get(`/posts/${postId}/comments/count`);
                setCommentsCount(response.data.count);
            } catch (error) {
                console.error("Error fetching comment count:", error);
            }
        };

        fetchPost();
        fetchLikedState();
        fetchPostCommentsCount();
    }, [postId, userId]);

    const handleImageClick = (e, imageUrl) => {
        e.stopPropagation();
        setSelectedImage(imageUrl);
    };

    const closeImage = () => {
        setSelectedImage(null);
    };

    const handleLikeClick = async (e) => {
        e.stopPropagation();
        try {
            if (liked) {
                await api.delete(`/posts/${postId}/like`);
                setPost(prevPost => ({
                    ...prevPost,
                    _count: { ...prevPost._count, likes: prevPost._count.likes - 1 }
                }));
            } else {
                await api.post(`/posts/${postId}/like`);
                setPost(prevPost => ({
                    ...prevPost,
                    _count: { ...prevPost._count, likes: prevPost._count.likes + 1 }
                }));
            }
            setLiked(prevLiked => !prevLiked);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        navigate(`/submit-post/${postId}`);
    };

    const handleDeleteClick = async (e) => {
        e.stopPropagation();
        try {
            // Delete post images if any using query
            const removedImages = post.images;
            if (removedImages.length > 0) {
                const deleteIds = removedImages.map((image) => image.id).join(',');
                const deletePublicIds = removedImages.map((image) => image.publicId).join(',');
                await api.delete(`/images?deleteIds=${deleteIds}&deletePublicIds=${deletePublicIds}`);
            }
            
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(post => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const redirectToPost = (e) => {
        e.stopPropagation();
        navigate(`/posts/${postId}`);
    };

    return (
        <div 
            key={post?.id} 
            className="post-item mb-6 bg-gray-700 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer relative" 
            onClick={(e) => redirectToPost(e)}
        >
            {/* Author Section */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <img 
                        src={post?.author?.profilePictureUrl} 
                        alt={`${post?.author?.username}'s profile`} 
                        className="w-12 h-12 rounded-full object-cover cursor-pointer" 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate(`/profile/${post?.authorId}`); 
                        }}
                    />
                    <div>
                        <h3 
                            className="text-lg font-semibold text-blue-400 cursor-pointer hover:underline"
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                navigate(`/profile/${post?.authorId}`); 
                            }}
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
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        navigate(`/realms/${post?.realmId}`);
                                    }} 
                                />
                                <span 
                                    className="ml-1 text-sm font-semibold cursor-pointer hover:underline"
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        navigate(`/realms/${post?.realmId}`);
                                    }}
                                >
                                    {post?.realm?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {isEditable && (
                    <div className="space-x-4">
                        <button onClick={(e) => handleEditClick(e)} className="text-blue-400 hover:underline">
                            Edit
                        </button>
                        <button onClick={(e) => handleDeleteClick(e)} className="text-red-400 hover:underline">
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Post Content */}
            <div className="mb-4">
                <h3 className="text-2xl font-bold mb-2 text-gray-100">{post?.title}</h3>
                {post?.text && <p className="text-gray-300 mb-4">{post?.text}</p>}
                {post?.images && post?.images.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-4">
                        {post?.images.map((image, index) => (
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
                        icon={liked ? faHeartFilled : faHeart} 
                        className={`text-xl ${liked ? 'text-red-500' : 'text-gray-400'}`} 
                    />
                    <span className="ml-1">{post?._count.likes}</span>
                </span>
                <span className="flex items-center space-x-1">
                    <FontAwesomeIcon icon={faComment} className="text-xl" />
                    <span className="ml-1">{commentsCount}</span>
                </span>
            </div>

            {selectedImage && (
                <ImageViewer imageUrl={selectedImage} onClose={closeImage} />
            )}
        </div>
    );
};

export default PostPreview;
