import { useEffect, useState } from "react";
import api from "../services/api";
import ImageViewer from "../components/modals/ImageViewer";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const PostPreview = ({ postId, isEditable }) => {
    const [post, setPost] = useState(null);
    const [liked, setLiked] = useState(null);
    const [commentsCount, setCommentsCount] = useState(null);
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
                const usersLiked = response.data.usersWhoLikedPost.map(user => user.id);
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
                const updatedPost = { ...post };
                updatedPost._count.likes--;
                setPost(updatedPost);
            } else {
                await api.post(`/posts/${postId}/like`);
                const updatedPost = { ...post };
                updatedPost._count.likes++;
                setPost(updatedPost);
            }
            setLiked(prevLiked => !prevLiked);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        navigate(`/edit-post/${postId}`);
    };

    const handleDeleteClick = async (e) => {
        e.stopPropagation();
        try {
            await api.delete(`/posts/${postId}`);
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const redirectToPost = (e) => {
        e.stopPropagation();
        navigate(`/posts/${postId}`);
    };

    const formatTime = (dt) => {
        return formatDistanceToNow(new Date(dt), { addSuffix: true });
    };

    return (
        <div 
            key={post?.id} 
            className="post-item mb-6 bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer" 
            onClick={(e) => redirectToPost(e)}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <img 
                        src={post?.author?.profilePictureUrl} 
                        alt={`${post?.author?.username}'s profile`} 
                        className="w-10 h-10 rounded-full object-cover cursor-pointer" 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate(`/profile/${post?.authorId}`); 
                        }}
                    />
                    <div>
                        <h3 
                            className="text-lg font-semibold text-blue-500 cursor-pointer hover:underline"
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                navigate(`/profile/${post?.authorId}`); 
                            }}
                        >
                            {post?.author?.username}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {post?.createdAt && formatTime(post?.createdAt)}
                        </p>
                    </div>
                </div>
                {isEditable && (
                    <div className="space-x-4">
                        <button onClick={(e) => handleEditClick(e)} className="text-blue-500 hover:underline">
                            Edit
                        </button>
                        <button onClick={(e) => handleDeleteClick(e)} className="text-red-500 hover:underline">
                            Delete
                        </button>
                    </div>
                )}
            </div>
            <div className="mb-4">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{post?.title}</h3>
                {post?.text && <p className="text-gray-700 mb-4">{post?.text}</p>}
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
            <div className="post-meta text-gray-600 flex items-center space-x-6">
                <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {post?._count.likes}
                </span>
                <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 22.54c-.84 0-1.67-.18-2.45-.53-2.16-.96-3.86-2.64-4.85-4.65-.98-2.02-.99-4.27-.03-6.28 1.53-3.23 5.03-5.29 8.79-4.59C19.04 7.4 22 11.11 22 15.29c0 1.55-.43 3.1-1.25 4.44-.81 1.35-2 2.48-3.42 3.19-1.41.7-2.96 1.02-4.54 1.02-.13 0-.26 0-.38-.02-.01 0-.03 0-.04-.01C12.01 22.54 12.01 22.54 12 22.54zM8 17.06c.94 1.83 2.77 3.06 4.92 3.15.15.01.3.02.44.02 1.15 0 2.28-.3 3.28-.89 1.01-.59 1.81-1.46 2.33-2.48.53-1.03.77-2.18.72-3.3-.02-2.9-2.08-5.47-4.94-6.13-1.48-.34-3.03-.07-4.36.74-1.33.8-2.29 2.03-2.68 3.48-.33 1.23-.31 2.51.05 3.72.36 1.21 1.08 2.28 2.03 3.07.01.01.01.01.01.02.08.07.16.14.24.2z"/>
                    </svg>
                    {commentsCount}
                </span>
                <button 
                    onClick={(e) => handleLikeClick(e)} 
                    className={`py-2 px-4 rounded-md font-semibold focus:outline-none ${liked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                    {liked ? 'Liked' : 'Like'}
                </button>
            </div>

            {selectedImage && (
                <ImageViewer imageUrl={selectedImage} onClose={closeImage} />
            )}
        </div>
    );
};

export default PostPreview;
