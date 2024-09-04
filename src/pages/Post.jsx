import { useEffect, useState } from "react";
import api from "../services/api";
import ImageViewer from "../components/modals/ImageViewer";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import CommentsList from "../components/CommentsList";

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


    console.log(post);
    return (
        <>
            <Navbar />
            <div className="container mx-auto p-4">
                {post && (
                    <>
                        <div className="post-item bg-white p-6 rounded-lg shadow-md mb-6">
                            <h1 className="text-3xl font-semibold mb-2">{post.title}</h1>
                            <h3 className="text-gray-500 mb-4">Posted under {post.realm.name}</h3>
                            {post.text && <p className="text-gray-800 mb-4">{post.text}</p>}
                            {post.images && post.images.length > 0 && (
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {post.images.map((image, index) => (
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
                            <button 
                                onClick={(e) => handleLikeClick(e)} 
                                className={`py-2 px-4 rounded-md font-semibold focus:outline-none ${liked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                            >
                                {liked ? 'Liked' : 'Like'}
                            </button>
                                <span className="cursor-pointer" onClick={() => navigate(`/posts/${post.id}/liked`)}>Likes: {post._count?.likes}</span>
                                <span>Comments: {commentsCount}</span>
                            </div>
                        </div>
                        
                        <section>
                            <CommentsList postId={postId} setCommentsCount={setCommentsCount}/>
                        </section>

                    </>
                )}

                {selectedImage && (
                    <ImageViewer imageUrl={selectedImage} onClose={closeImage} />
                )}
            </div>
        </>
    );
};

export default PostPage;
