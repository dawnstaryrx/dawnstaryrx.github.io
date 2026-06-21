import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { motion } from 'framer-motion';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

const techTags = ['Java', 'Spring Boot', 'React', 'Vue', 'MySQL', 'Redis', 'Docker', 'AI'];

const metrics = [
  { value: '120+', label: '技术笔记' },
  { value: '15+', label: '项目实践' },
  { value: '8', label: '研究方向' },
];

const featured = [
  { title: 'AI 与深度学习', desc: '探索人工智能前沿，从理论到工程实践', href: '/blog', icon: '◈' },
  { title: '后端架构设计', desc: 'Java / Spring Boot 微服务与系统设计', href: '/docs/knowledge/intro', icon: '◉' },
  { title: '开源项目', desc: '从想法到落地的完整项目历程', href: '/docs/project/intro', icon: '◎' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

function CodeWindow() {
  return (
    <div className={styles.codeWindow}>
      <div className={styles.codeTitleBar}>
        <div className={styles.codeDots}>
          <span className={clsx(styles.codeDot, styles.codeDotRed)} />
          <span className={clsx(styles.codeDot, styles.codeDotYellow)} />
          <span className={clsx(styles.codeDot, styles.codeDotGreen)} />
        </div>
        <span className={styles.codeTitleText}>assistant.py</span>
      </div>
      <div className={styles.codeBody}>
        <div className={styles.codeLine}><span className={styles.codeKw}>class</span> <span className={styles.codeFn}>AIAssistant</span>:</div>
        <div className={styles.codeLine}>  <span className={styles.codeKw}>def</span> <span className={styles.codeFn}>__init__</span>(self, model):</div>
        <div className={styles.codeLine}>    self.model = model</div>
        <div className={styles.codeLine}>    self.memory = []</div>
        <div className={styles.codeLine} />
        <div className={styles.codeLine}>  <span className={styles.codeKw}>def</span> <span className={styles.codeFn}>analyze</span>(self, prompt):</div>
        <div className={styles.codeLine}>    context = self.<span className={styles.codeFn}>recall</span>(prompt)</div>
        <div className={styles.codeLine}>    <span className={styles.codeKw}>return</span> self.model.<span className={styles.codeFn}>generate</span>(</div>
        <div className={styles.codeLine}>      prompt, context=context)</div>
        <div className={styles.codeLine}><span className={styles.codeCursor} /></div>
      </div>
    </div>
  );
}

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroBgGrid} aria-hidden="true" />
      <div className={styles.heroAurora} aria-hidden="true">
        <div className={clsx(styles.heroAuroraBlob, styles.heroAuroraBlob1)} />
        <div className={clsx(styles.heroAuroraBlob, styles.heroAuroraBlob2)} />
        <div className={clsx(styles.heroAuroraBlob, styles.heroAuroraBlob3)} />
      </div>
      <div className={styles.heroNoise} aria-hidden="true" />

      <div className={styles.heroInner}>
        <motion.div
          className={styles.heroLayout}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          <motion.div className={styles.heroLeft} variants={fadeUp} custom={0}>
            <motion.div className={styles.heroBadge} variants={scaleIn}>
              <span className={styles.heroBadgeDot} aria-hidden="true" />
              探索技术
            </motion.div>
            <motion.h1 className={styles.heroTitle} variants={fadeUp} custom={0.1}>
              <span className={styles.heroTitleGradient}>Building Intelligent Systems</span>
            </motion.h1>
            <motion.p className={styles.heroSubtitle} variants={fadeUp} custom={0.2}>
              探索人工智能、软件开发与科研实践 — 记录每一次思考，分享每一份成长
            </motion.p>
            <motion.div className={styles.heroTechTags} variants={fadeUp} custom={0.35}>
              {techTags.map((tag, i) => (
                <motion.span
                  key={tag}
                  className={styles.heroTechTag}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.04, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
            <motion.div className={styles.heroButtons} variants={fadeUp} custom={0.5}>
              <Link to="/blog" className={styles.heroBtnPrimary}>
                开始阅读
                <span className={styles.heroBtnArrow} aria-hidden="true">→</span>
              </Link>
              <Link to="/docs/knowledge/intro" className={styles.heroBtnSecondary}>
                知识库
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.heroRight}
            variants={fadeUp}
            custom={0.3}
          >
            <CodeWindow />
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.heroMetrics}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          {metrics.map((m) => (
            <div key={m.label} className={styles.heroMetric}>
              <span className={styles.heroMetricValue}>{m.value}</span>
              <span className={styles.heroMetricLabel}>{m.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className={styles.heroScroll} aria-hidden="true">
        <div className={styles.heroScrollLine} />
      </div>
    </header>
  );
}

function FeaturedSection() {
  return (
    <section className={styles.featuredSection}>
      <div className="container">
        <motion.div
          className={styles.featuredGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {featured.map((item) => (
            <motion.a
              key={item.title}
              href={item.href}
              className={styles.featuredCard}
              variants={fadeUp}
              custom={0}
            >
              <span className={styles.featuredIcon}>{item.icon}</span>
              <div className={styles.featuredContent}>
                <h3 className={styles.featuredTitle}>{item.title}</h3>
                <p className={styles.featuredDesc}>{item.desc}</p>
              </div>
              <span className={styles.featuredArrow} aria-hidden="true">→</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
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
        <FeaturedSection />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}