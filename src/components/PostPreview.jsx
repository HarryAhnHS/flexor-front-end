import { useEffect, useState } from "react";
import api from "../services/api";
import ImageViewer from "../components/modals/ImageViewer";
import { useNavigate } from "react-router-dom";

const PostPreview = ({ postId }) => {
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
            }
            catch(error) {
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
            } 
            catch (error) {
                console.error("Error fetching comment count:", error);
            }
        }

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
                const updatedPost = {...post};
                updatedPost._count.likes--;
                setPost(updatedPost);
            } else {
                await api.post(`/posts/${postId}/like`);
                const updatedPost = {...post};
                updatedPost._count.likes++;
                setPost(updatedPost);
            }
            setLiked(prevLiked => !prevLiked);
        } 
        catch (error) {
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
        } 
        catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const redirectToPost = (e) => {
        e.stopPropagation();
        navigate(`/posts/${postId}`);
    }

    return (
        <div key={post?.id} className="post-item mb-6 bg-white p-6 rounded-lg shadow-md cursor-pointer" onClick={(e) => redirectToPost(e)}>
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold mb-2">{post?.title}</h3>
                <h3 className="text-gray">Posted under {post?.realm.name}</h3>
            </div>
            {post?.text && <p className="text-gray-800 mb-4">{post?.text}</p>}
            {post?.images && post?.images.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4">
                    {post?.images.map((image, index) => (
                        <img 
                            key={index} 
                            src={image.url} 
                            alt={`Post Image ${index + 1}`} 
                            className="w-32 h-32 object-cover rounded-md cursor-pointer" 
                            onClick={(e) => handleImageClick(e, image.url)}
                        />
                    ))}
                </div>
            )}
            <div className="post-meta text-gray-600 flex items-center space-x-4">
                <span>Likes: {post?._count.likes}</span>
                <span>Comments: {commentsCount}</span>
                <button 
                    onClick={(e) => handleLikeClick(e)} 
                    className={`py-2 px-4 rounded-md font-semibold focus:outline-none ${liked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                    {liked ? 'Liked' : 'Like'}
                </button>

                {post?.authorId === userId && (
                    <div className="space-x-4">
                        <button onClick={(e) => handleEditClick(e)} className="text-blue-500">
                            Edit
                        </button>
                        <button onClick={(e) => handleDeleteClick(e)} className="text-red-500">
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {selectedImage && (
                <ImageViewer imageUrl={selectedImage} onClose={(e) => closeImage(e)} />
            )}
        </div>
    );
};

export default PostPreview;
