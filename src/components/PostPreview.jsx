/*post res format { 
                    userId,
                    published: true
                },
                include: {
                    realm: true,
                    images: true,
                    author: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        }
                    },
                }
*/

import { useEffect, useState } from "react";
import api from "../services/api";

const PostPreview = ({post}) => {
    const [liked, setLiked] = useState(null);
    const [likesCount, setLikesCount] = useState(post._count.likes);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        async function getLikedState() {
            try {
                const response = await api.get(`/posts/${post.id}/liked`);
                const usersLiked = (response.data.usersWhoLikedPost).map((user) => user.id);
                if (usersLiked.includes(userId)) {
                    setLiked(true);
                }
                else {
                    setLiked(false);
                }
            }
            catch(error) {
                console.error('Error getting liked user Ids:', error);
            }
        };
        getLikedState();
    }, [post.id, userId])

    const handleLikeClick = async () => {
        try {
            if (liked) {
                await api.delete(`/posts/${post.id}/like`);
                setLikesCount(likesCount - 1);
            } else {
                await api.post(`/posts/${post.id}/like`);
                setLikesCount(likesCount + 1);
            }
            setLiked(!liked);
        } catch (error) {
            console.error('Error toggling like:', error);
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
                            className="w-32 h-32 object-cover rounded-md" 
                        />
                    ))}
                </div>
            )}
            <div className="post-meta text-gray-600 flex items-center space-x-4">
                <span>Likes: {likesCount}</span>
                <span>Comments: {post._count.comments}</span>
                <button 
                    onClick={handleLikeClick} 
                    className={`py-2 px-4 rounded-md font-semibold focus:outline-none ${liked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                    {liked ? 'Unlike' : 'Like'}
                </button>
            </div>
        </div>
    )
};

export default PostPreview;