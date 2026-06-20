import React from 'react';
import Layout from '@theme-original/Layout';
import ReadingProgress from '@site/src/components/ReadingProgress';
import {useLocation} from '@docusaurus/router';

export default function LayoutWrapper(props) {
  const location = useLocation();
  const isBlogPost = location.pathname.startsWith('/blog/') && location.pathname !== '/blog';

  return (
    <>
      {isBlogPost && <ReadingProgress />}
      <Layout {...props} />
    </>
  );
}