import { useEffect, useState } from "react";
import api from "../services/api";
import ImageViewer from "../components/modals/ImageViewer";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxArchive, faEllipsis, faImage, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

const DraftPreview = ({ postId, posts, setPosts }) => {
    const [post, setPost] = useState(null);
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
        fetchPost();
    }, [postId]);

    const handleImageClick = (e, imageUrl) => {
        e.stopPropagation();
        setSelectedImage(imageUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
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

    const formatTime = (dt) => {
        return formatDistanceToNow(new Date(dt), { addSuffix: true });
    };

    return (
        <div 
            key={post?.id} 
            className="relative mb-6 bg-gray-800 text-white px-6 pb-6 rounded-lg shadow-md transition-shadow duration-300 cursor-pointer group"
            onClick={handleEditClick}
        >
            {/* Draft Badge */}
            <div className="pt-6 mb-2 text-gray-400 font-bold text-sm space-x-1">
                <FontAwesomeIcon icon={faBoxArchive} />
                <span>Draft</span>
            </div>

            {/* Author and Metadata Section */}
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
                                {post?.createdAt && formatTime(post?.createdAt)}
                            </p>
                            {post?.realm &&
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
                            }
                        </div>
                    </div>
                </div>
                {post?.authorId === userId && (
                    <div className="flex items-center px-3 text-gray-400">
                        <Menu as="div" className="relative">
                            <MenuButton onClick={(e) => e.stopPropagation()}>
                                <FontAwesomeIcon icon={faEllipsis} className="hover:text-gray-300"/>
                            </MenuButton>
                            <MenuItems className="absolute right-0 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-md w-40">
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
                            </MenuItems>
                        </Menu>
                    </div>
                )}
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

            {selectedImage && (
                <ImageViewer imageUrl={selectedImage} onClose={closeModal} />
            )}
        </div>
    );
};

export default DraftPreview;
