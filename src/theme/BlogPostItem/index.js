import React from 'react';
import BlogPostItem from '@theme-original/BlogPostItem';
import {motion} from 'framer-motion';

export default function BlogPostItemWrapper(props) {
  return (
    <motion.div
      initial={{opacity: 0, y: 16}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, margin: '-30px'}}
      transition={{duration: 0.4}}
    >
      <BlogPostItem {...props} />
    </motion.div>
  );
}