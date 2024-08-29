import { formatDistanceToNow } from "date-fns";

const Comment = ({ comment, renderNestedComments }) => {
    return (
        <div key={comment.id} className="comment bg-gray-100 p-4 rounded-lg mb-4">
            <div className="flex items-center">
                <img
                    src={comment.user.profilePictureUrl}
                    className="w-[30px] h-[30px] object-cover rounded-full"
                    alt="Profile"
                />
                <span className="text-base text-gray-500">@{comment.user.username}</span>
                <span className="px-2 text-base text-gray-500">&#x2022;</span>
                <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
            </div>
            <p className="text-gray-800 mt-3">{comment.comment}</p>
            {comment.nestedComments && comment.nestedComments.length > 0 && (
                <div className="nested-comments">
                    {renderNestedComments(comment.nestedComments)}
                </div>
            )}
        </div>
    );
};

export default Comment;
