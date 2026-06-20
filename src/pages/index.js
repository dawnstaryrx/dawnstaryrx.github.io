import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { motion } from 'framer-motion';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

const techTags = ['Java', 'Spring Boot', 'React', 'Vue', 'MySQL', 'Redis', 'Docker', 'AI'];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroBgGrid} />
      <div className={styles.heroAurora}>
        <div className={clsx(styles.heroAuroraBlob, styles.heroAuroraBlob1)} />
        <div className={clsx(styles.heroAuroraBlob, styles.heroAuroraBlob2)} />
        <div className={clsx(styles.heroAuroraBlob, styles.heroAuroraBlob3)} />
      </div>
      <motion.div
        className={styles.heroContent}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className={styles.heroBadge}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <span className={styles.heroBadgeDot} />
          探索技术
        </motion.div>
        <motion.h1
          className={styles.heroTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className={styles.heroTitleGradient}>Building Intelligent Systems</span>
        </motion.h1>
        <motion.p
          className={styles.heroSubtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          探索人工智能、软件开发与科研实践 — 记录每一次思考，分享每一份成长
        </motion.p>
        <motion.div
          className={styles.heroTechTags}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {techTags.map((tag, i) => (
            <motion.span
              key={tag}
              className={styles.heroTechTag}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.06 }}
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>
        <motion.div
          className={styles.heroButtons}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <Link to="/blog" className={styles.heroBtnPrimary}>
            开始阅读 →
          </Link>
          <Link to="/docs/knowledge/intro" className={styles.heroBtnSecondary}>
            知识库
          </Link>
        </motion.div>
      </motion.div>
      <div className={styles.heroScroll}>
        <div className={styles.heroScrollLine} />
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="探索人工智能、软件开发与科研实践">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}