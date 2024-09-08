import { useEffect, useState } from "react";
import api from "../services/api";
import ImageViewer from "../components/modals/ImageViewer";
import { useNavigate, useParams } from "react-router-dom";
import CommentsList from "../components/CommentsList";
import { formatTime } from "../utils/formatters";

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

    console.log(post);
    console.log(commentsCount);

    return (
        <>
            <div className="container mx-auto p-4">
                {post && (
                    <div className="post-item bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <img 
                                    src={post?.author?.profilePictureUrl} 
                                    alt={`${post?.author?.username}'s profile`} 
                                    className="w-10 h-10 rounded-full object-cover cursor-pointer" 
                                    onClick={(e) => redirectToProfile(e, post?.authorId)}
                                />
                                <div>
                                    <h3 
                                        className="text-lg font-semibold text-blue-500 cursor-pointer hover:underline"
                                        onClick={(e) => redirectToProfile(e, post?.authorId)}
                                    >
                                        {post?.author?.username}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {post?.createdAt && formatTime(post?.createdAt)}
                                    </p>
                                </div>
                            </div>
                            {userId === post?.authorId && (
                                <div className="space-x-4">
                                    <button onClick={(e) => handleEditClick(e)} className="text-blue-500 hover:underline">
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center mb-4">
                            <img 
                                src={post?.realm?.realmPictureUrl} 
                                alt={`${post?.realm?.name} realm picture`} 
                                className="w-8 h-8 rounded-full object-cover cursor-pointer"
                                onClick={(e) => redirectToRealm(e, post?.realmId)}
                            />
                            <h4 
                                className="ml-2 text-sm font-semibold text-gray-700 cursor-pointer hover:underline"
                                onClick={(e) => redirectToRealm(e, post?.realmId)}
                            >
                                Under {post?.realm?.name}
                            </h4>
                        </div>

                        <h1 className="text-3xl font-semibold mb-2">{post.title}</h1>
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
                        <div className="post-meta text-gray-600 flex items-center space-x-6">
                            <button 
                                onClick={(e) => handleLikeClick(e)} 
                                className={`py-2 px-4 rounded-md font-semibold focus:outline-none ${liked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                            >
                                {liked ? 'Liked' : 'Like'}
                            </button>
                            <span className="flex items-center">
                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                {post._count.likes}
                            </span>
                            <span className="flex items-center">
                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 22.54c-.84 0-1.67-.18-2.45-.53-2.16-.96-3.86-2.64-4.85-4.65-.98-2.02-.99-4.27-.03-6.28 1.53-3.23 5.03-5.29 8.79-4.59C19.04 7.4 22 11.11 22 15.29c0 1.55-.43 3.1-1.25 4.44-.81 1.35-2 2.48-3.42 3.19-1.41.7-2.96 1.02-4.54 1.02-.13 0-.26 0-.38-.02-.01 0-.03 0-.04-.01C12.01 22.54 12.01 22.54 12 22.54zM8 17.06c.94 1.83 2.77 3.06 4.92 3.15.15.01.3.02.44.02 1.15 0 2.28-.3 3.28-.89 1.01-.59 1.81-1.46 2.33-2.48.53-1.03.77-2.18.72-3.3-.02-2.9-2.08-5.47-4.94-6.13-1.48-.34-3.03-.07-4.36.74-1.33.8-2.29 2.03-2.68 3.48-.33 1.23-.31 2.51.05 3.72.36 1.21 1.08 2.28 2.03 3.07.01.01.01.02.02.02.92.91 2.02 1.5 3.26 1.82.56.15 1.12.22 1.68.22.65 0 1.29-.12 1.91-.36.8-.31 1.53-.8 2.13-1.42.38-.39.73-.83 1.02-1.29.29-.47.54-.96.76-1.48.22-.52.42-1.05.57-1.6.09-.39.15-.78.17-1.16.04-.51-.07-1.01-.28-1.48-.28-.72-.74-1.38-1.3-1.94-.57-.56-1.25-.96-1.98-1.19-.63-.22-1.3-.26-1.94-.08-.68.2-1.33.56-1.85 1.01-.48.4-.88.87-1.16 1.39-.28.5-.43 1.06-.43 1.61v.06c-.02.58.21 1.14.59 1.57.38.43.91.69 1.45.69.09 0 .18-.01.27-.02.21-.03.43-.09.63-.2.27-.14.53-.32.76-.54.3-.28.58-.58.83-.91.21-.29.39-.6.54-.93.05-.09.1-.18.14-.28.04-.1.08-.2.1-.3.03-.16.05-.32.07-.48.02-.1.03-.19.03-.29 0-.06-.01-.12-.01-.17-.01-.16-.06-.32-.15-.47-.09-.15-.22-.28-.38-.39-.09-.07-.18-.12-.29-.16-.12-.03-.24-.05-.36-.06-.18-.01-.36.02-.54.06-.13.03-.26.1-.38.18-.16.11-.29.26-.4.43-.1.15-.17.33-.21.51-.04.2-.07.41-.08.62-.03.56.08 1.12.31 1.64.24.56.58 1.06 1.01 1.5.38.39.82.73 1.29 1.01.47.29.97.53 1.5.69.37.12.74.2 1.12.2.27 0 .54-.03.8-.1.34-.1.66-.28.96-.48.31-.2.62-.46.88-.75.17-.2.33-.41.46-.63.11-.19.21-.39.27-.59.04-.15.06-.3.07-.45.01-.11.01-.22.01-.33.02-.43-.15-.85-.46-1.18-.2-.25-.46-.46-.74-.62-.28-.15-.58-.25-.89-.31-.16-.02-.32-.02-.48-.02-.36 0-.71.07-1.05.2-.61.22-1.2.57-1.73 1-.43.36-.82.76-1.15 1.21-.34.45-.62.96-.78 1.49-.07.24-.1.49-.1.73z"/>
                                </svg>
                                {commentsCount}
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
        </>
    );
};

export default PostPage;
