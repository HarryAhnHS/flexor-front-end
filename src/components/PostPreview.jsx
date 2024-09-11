import { useEffect, useState } from "react";
import api from "../services/api";
import ImageViewer from "../components/modals/ImageViewer";
import { useNavigate } from "react-router-dom";
import { formatTime } from '../utils/formatters';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faHeart } from "@fortawesome/free-regular-svg-icons";
import { faEllipsis, faHeart as faHeartFilled, faImage, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { PuffLoader } from 'react-spinners';

const PostPreview = ({ post, postId, isEditable, posts, setPosts }) => {
    const [liked, setLiked] = useState(false);
    const [commentsCount, setCommentsCount] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);

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
            finally {
                setLoading(false);
            }
        };

        // fetchPost();
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
                setPosts(prevPosts =>
                    prevPosts.map((p) =>
                        p.id === postId
                            ? {
                                  ...p,
                                  _count: { ...p._count, likes: p._count.likes - 1 },
                              }
                            : p
                    )
                );
            } else {
                await api.post(`/posts/${postId}/like`);
                setPosts(prevPosts =>
                    prevPosts.map((p) =>
                        p.id === postId
                            ? {
                                  ...p,
                                  _count: { ...p._count, likes: p._count.likes + 1 },
                              }
                            : p
                    )
                );
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
            className="post-item mb-6 bg-gray-800 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer relative" 
            onClick={(e) => redirectToPost(e)}
        >
            {loading 
            ? 
                <div className="flex justify-center items-center h-[350px]">
                    <PuffLoader color="#5C6BC0" size={60} />
                </div>
            :
            <>
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
                    
                        <div className="flex items-center px-3 text-gray-400">
                        <Menu as="div" className="relative">
                            <MenuButton onClick={(e) => e.stopPropagation()}>
                                <FontAwesomeIcon icon={faEllipsis} className="hover:text-gray-300"/>
                            </MenuButton>
                            <MenuItems 
                                className="absolute right-0 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-md w-40"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isEditable && (
                                    <>
                                        <MenuItem>
                                                <button
                                                    onClick={handleEditClick}
                                                    className='pl-6 text-left space-x-3 w-full py-2 text-sm hover:bg-gray-600'
                                                >
                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                    <span>Edit</span>
                                                </button>
                                        </MenuItem>
                                        <MenuItem>
                                                <button
                                                    onClick={handleDeleteClick}
                                                    className='pl-6 text-left space-x-3 w-full py-2 text-sm hover:bg-gray-600'
                                                >
                                                    <FontAwesomeIcon icon={faTrashCan} />
                                                    <span>Delete</span>
                                                </button>
                                        </MenuItem>
                                    </>
                                )}
                                <MenuItem>
                                    <button
                                        onClick={() => navigate(`/posts/${postId}/liked`)}
                                        className='pl-6 text-left space-x-3 w-full py-2 text-sm hover:bg-gray-600'
                                    >
                                        <FontAwesomeIcon icon={faHeartFilled} />
                                        <span>Liked Users</span>
                                    </button>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                    </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                    <h3 className="text-2xl font-bold mb-2 text-gray-100 overflow-hidden text-ellipsis overflow-wrap-break-word break-all line-clamp-1">{post?.title}</h3>
                    {post?.text && (
                        <p className="text-gray-300 mb-4 overflow-hidden text-ellipsis overflow-wrap-break-word break-all line-clamp-5">
                            {post?.text}
                        </p>
                    )}

                    {post?.images && post?.images.length > 0 && (
                        <>
                            <FontAwesomeIcon icon={faImage} className="mb-2 text-gray-300"/>
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
                        </>
                    )}
                </div>

                {/* Post Meta */}
                <div className="post-meta text-gray-400 flex items-center space-x-6">
                    <span className="flex items-center space-x-2">
                        <FontAwesomeIcon 
                            onClick={(e) => handleLikeClick(e)} 
                            icon={liked ? faHeartFilled : faHeart} 
                            className={`text-xl ${liked ? 'text-red-500' : 'text-gray-400'}`} 
                        />
                        <span onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/posts/${postId}/liked`)}}
                            >
                            {post?._count.likes}
                        </span>
                    </span>
                    <span className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faComment} className="text-xl" />
                        <span className="ml-1">{commentsCount}</span>
                    </span>
                </div>

                {selectedImage && (
                    <ImageViewer imageUrl={selectedImage} onClose={closeImage} />
                )}
            </>
        }
        </div>
    );
};

export default PostPreview;
