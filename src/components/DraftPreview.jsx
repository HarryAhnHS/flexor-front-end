import { useEffect, useState } from "react";
import api from "../services/api";
import ImageViewer from "../components/modals/ImageViewer";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const DraftPreview = ({postId, posts, setPosts}) => {

    const [post, setPost] = useState(null);
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
        fetchPost();
    }, [postId]);

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const handleEditClick = () => {
        navigate(`/submit-post/${postId}`);
    };

    const handleDeleteClick = async () => {
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

    const formatTime = (dt) => {
        return formatDistanceToNow(new Date(dt), {addSuffix: true});
    };

    return (
        <div key={post?.id} className="post-item mb-6 bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold mb-2">{post?.title}</h3>
                <div>
                    {post?.realm ? <h3 className="text-gray">Posted under {post?.realm.name}</h3> : null}
                    <p>{post?.createdAt && formatTime(post?.createdAt)}</p>
                </div>
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
                            onClick={() => handleImageClick(image.url)}
                        />
                    ))}
                </div>
            )}
            <div className="post-meta text-gray-600 flex items-center space-x-4">
                {post?.authorId === userId 
                    ? 
                        <div className="space-x-4">
                            <button onClick={handleEditClick} className="text-blue-500">
                                Edit
                            </button>
                            <button onClick={handleDeleteClick} className="text-red-500">
                                Delete
                            </button>
                        </div>
                    :
                        null
                }
                
            </div>

            {selectedImage && (
                <ImageViewer imageUrl={selectedImage} onClose={closeModal} />
            )}
        </div>
    )
};

export default DraftPreview;