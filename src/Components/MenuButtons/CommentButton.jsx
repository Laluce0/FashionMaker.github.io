import React from 'react';
import { Button } from 'antd';
import CommentIcon from '../../assets/08_comment.svg'; // Adjust path as needed

const CommentButton = () => {
  return (
    <Button 
      type="text" 
      icon={<img src={CommentIcon} alt="Comment" />} 
      className="menu-button"
    />
  );
};

export default CommentButton;