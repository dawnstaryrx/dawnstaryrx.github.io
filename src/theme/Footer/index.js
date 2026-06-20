import React from 'react';
import Footer from '@theme-original/Footer';
import {motion} from 'framer-motion';

function FooterLayout({children}) {
  return (
    <motion.footer
      initial={{opacity: 0}}
      whileInView={{opacity: 1}}
      viewport={{once: true}}
      transition={{duration: 0.6}}
      style={{
        background: 'var(--ifm-footer-background-color)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {children}
    </motion.footer>
  );
}

export default function FooterWrapper(props) {
  return <Footer {...props} />;
}

export {FooterLayout};