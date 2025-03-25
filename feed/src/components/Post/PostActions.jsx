import React from 'react';
import styles from './Post.module.css';

const PostActions = ({ isLiked, onLike }) => {
  return (
    <div className={styles.actions}>
      <button 
        onClick={onLike}
        className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
      >
        <span>Like</span>
      </button>
      <button className={styles.actionButton}>
        <span>Comment</span>
      </button>
      <button className={styles.actionButton}>
        <span>Share</span>
      </button>
    </div>
  );
};

export default PostActions;