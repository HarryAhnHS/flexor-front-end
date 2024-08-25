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

const PostPreview = ({post}) => {
    return (
        <div key={post.id} className="post-item mb-4">
            <h3 className="text-xl font-semibold">{post.title}</h3>
            <p className="text-gray-600">{post.content}</p>
            <div className="post-meta text-gray-500">
            <span>Likes: {post.likes}</span>
            <span>Comments: {post.comments}</span>
            </div>
        </div>
    )
};

export default PostPreview;