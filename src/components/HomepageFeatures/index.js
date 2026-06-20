import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useBlogPost} from '@docusaurus/theme-common/internal';
import {motion} from 'framer-motion';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const statsData = [
  {label: '文章', number: '10+', icon: '✍️'},
  {label: '分类', number: '5', icon: '📂'},
  {label: '标签', number: '15+', icon: '🏷️'},
  {label: '项目', number: '2+', icon: '🚀'},
];

const techStack = [
  {name: 'Java', icon: '☕', color: '#e76f00'},
  {name: 'Spring Boot', icon: '🍃', color: '#6db33f'},
  {name: 'React', icon: '⚛️', color: '#61dafb'},
  {name: 'Vue', icon: '💚', color: '#42b883'},
  {name: 'MySQL', icon: '🐬', color: '#4479a1'},
  {name: 'Redis', icon: '🔴', color: '#dc382d'},
  {name: 'Docker', icon: '🐳', color: '#2496ed'},
  {name: 'AI', icon: '🤖', color: '#8b5cf6'},
];

const projects = [
  {
    title: 'AI辅助软著编写系统',
    desc: '基于AI技术的软件著作权文档自动生成系统，提升软著申请效率。',
    tags: ['Java', 'Spring Boot', 'AI', 'Vue'],
    link: '/docs/project/intro',
  },
  {
    title: 'Go导航系统',
    desc: '高效的网址导航系统，支持分类管理、搜索和个性化配置。',
    tags: ['Go', 'Vue', 'MySQL'],
    link: '/docs/project/intro',
  },
];

const animProps = {
  initial: {opacity: 0, y: 20},
  whileInView: {opacity: 1, y: 0},
  viewport: {once: true, margin: '-50px'},
  transition: {duration: 0.5},
};

function StatsSection() {
  return (
    <section className={styles.statsSection}>
      <div className="container">
        <div className={styles.statsGrid}>
          {statsData.map((stat, i) => (
            <motion.div
              key={stat.label}
              className={styles.statCard}
              {...animProps}
              transition={{...animProps.transition, delay: i * 0.1}}
            >
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statNumber}>{stat.number}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechSection() {
  return (
    <section className={styles.techSection}>
      <div className="container">
        <motion.div className={styles.sectionHeader} {...animProps}>
          <Heading as="h2" className={styles.sectionTitle}>技术栈</Heading>
          <p className={styles.sectionDesc}>日常使用的技术与工具</p>
        </motion.div>
        <div className={styles.techGrid}>
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              className={styles.techCard}
              {...animProps}
              transition={{...animProps.transition, delay: i * 0.06}}
            >
              <div
                className={styles.techCardIcon}
                style={{background: `${tech.color}15`}}
              >
                {tech.icon}
              </div>
              <span className={styles.techCardName}>{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectSection() {
  return (
    <section className={styles.projectSection}>
      <div className="container">
        <motion.div className={styles.sectionHeader} {...animProps}>
          <Heading as="h2" className={styles.sectionTitle}>项目</Heading>
          <p className={styles.sectionDesc}>实践中的技术沉淀</p>
        </motion.div>
        <div className={styles.projectGrid}>
          {projects.map((project, i) => (
            <motion.a
              key={project.title}
              className={styles.projectCard}
              href={project.link}
              {...animProps}
              transition={{...animProps.transition, delay: i * 0.1}}
            >
              <div className={styles.projectCardHeader}>
                <h3 className={styles.projectCardTitle}>{project.title}</h3>
              </div>
              <p className={styles.projectCardDesc}>{project.desc}</p>
              <div className={styles.projectCardTags}>
                {project.tags.map(tag => (
                  <span key={tag} className={styles.projectCardTag}>{tag}</span>
                ))}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomepageFeatures() {
  return (
    <>
      <StatsSection />
      <TechSection />
      <ProjectSection />
    </>
  );
}