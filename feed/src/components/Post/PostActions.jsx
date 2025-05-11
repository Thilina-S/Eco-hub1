"use client"
import { FiHeart, FiMessageSquare, FiShare2 } from "react-icons/fi"
import { FaHeart } from "react-icons/fa"

const PostActions = ({ isLiked, onLike, onComment, onShare }) => {
  return (
    <div className="flex border-t border-gray-100">
      <button
        onClick={onLike}
        className={`flex-1 flex items-center justify-center py-2 ${
          isLiked ? "text-green-600" : "text-gray-700 hover:bg-gray-50"
        } rounded-md`}
      >
        {isLiked ? <FaHeart className="w-5 h-5 mr-2 text-green-600" /> : <FiHeart className="w-5 h-5 mr-2" />}
        <span>Like</span>
      </button>
      <button
        onClick={onComment}
        className="flex-1 flex items-center justify-center py-2 text-gray-700 hover:bg-gray-50 rounded-md"
      >
        <FiMessageSquare className="w-5 h-5 mr-2" />
        <span>Comment</span>
      </button>
      <button
        onClick={onShare}
        className="flex-1 flex items-center justify-center py-2 text-gray-700 hover:bg-gray-50 rounded-md"
      >
        <FiShare2 className="w-5 h-5 mr-2" />
        <span>Share</span>
      </button>
    </div>
  )
}

export default PostActions
