import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '记录开发日常',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        分享前后端开发过程中的经验、踩坑与解决方案。从编码细节到系统架构，
        这里记录每一次成长与思考，帮助你也帮助未来的自己。
      </>
    ),
  },
  {
    title: '技术洞察与项目实践',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        内容覆盖 Java后端、前端、服务器、AI 等技术。
        借由实际项目与日常实验沉淀知识，理解技术背后的逻辑。
      </>
    ),
  },
  {
    title: '一起交流，共同进步',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        热爱技术，也热爱分享。欢迎交流你的观点与想法。
        技术之路不必孤单，我们可以一起构建更好的知识世界。
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
