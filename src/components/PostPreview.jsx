import { useEffect, useState } from "react";
import api from "../services/api";
import ImageViewer from "../components/modals/ImageViewer";
import { useNavigate } from "react-router-dom";

const PostPreview = ({ post }) => {
    const [liked, setLiked] = useState(null);
    const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
    const [commentsCount, setCommentsCount] = useState(post._count?.comments || 0);
    const [selectedImage, setSelectedImage] = useState(null);

    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    // Fetch liked state and update likes count
    useEffect(() => {
        const getLikedState = async () => {
            try {
                const response = await api.get(`/posts/${post.id}/liked`);
                const usersLiked = response.data.usersWhoLikedPost.map(user => user.id);
                setLiked(usersLiked.includes(userId));
            } catch (error) {
                console.error('Error getting liked user Ids:', error);
            }
        };

        const getLikesCount = async () => {
            try {
                const response = await api.get(`/posts/${post.id}`);
                setLikesCount(response.data.post._count.likes);
                setCommentsCount(response.data.post._count.comments);
            } catch (error) {
                console.error('Error getting post counts:', error);
            }
        };

        getLikedState();
        getLikesCount();
    }, [post.id, userId]);

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const handleLikeClick = async () => {
        try {
            if (liked) {
                await api.delete(`/posts/${post.id}/like`);
                setLikesCount(prevCount => prevCount - 1);
            } else {
                await api.post(`/posts/${post.id}/like`);
                setLikesCount(prevCount => prevCount + 1);
            }
            setLiked(prevLiked => !prevLiked);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleEditClick = () => {
        navigate(`/edit-post/${post.id}`);
    };

    const handleDeleteClick = async () => {
        try {
            await api.delete(`/posts/${post.id}`);
            // Optionally handle post-deletion logic, e.g., removing the post from the list
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    return (
        <div key={post.id} className="post-item mb-6 bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold mb-2">{post.title}</h3>
                <h3 className="text-gray">Posted under {post.realm.name}</h3>
            </div>
            {post.text && <p className="text-gray-800 mb-4">{post.text}</p>}
            {post.images && post.images.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4">
                    {post.images.map((image, index) => (
                        <img 
                            key={index} 
                            src={image.url} 
                            alt={`Post Image ${index + 1}`} 
                            className="w-32 h-32 object-cover rounded-md cursor-pointer" 
                            onClick={() => handleImageClick(image.url)}
                        />
                    ))}
                </div>
            )}
            <div className="post-meta text-gray-600 flex items-center space-x-4">
                <span>Likes: {likesCount}</span>
                <span>Comments: {commentsCount}</span>
                <button 
                    onClick={handleLikeClick} 
                    className={`py-2 px-4 rounded-md font-semibold focus:outline-none ${liked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                    {liked ? 'Liked' : 'Like'}
                </button>

                {post.authorId === userId && (
                    <div className="space-x-4">
                        <button onClick={handleEditClick} className="text-blue-500">
                            Edit
                        </button>
                        <button onClick={handleDeleteClick} className="text-red-500">
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {selectedImage && (
                <ImageViewer imageUrl={selectedImage} onClose={closeModal} />
            )}
        </div>
    );
};

export default PostPreview;
