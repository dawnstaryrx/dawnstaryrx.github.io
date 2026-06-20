// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Hi, 我是东方既白',
  tagline: '一名开发者，热爱技术，热爱思考。记录前后端开发日常、踩坑经历与解决方案，以及对技术/项目的一些思考和感悟。🤝 欢迎一起交流讨论，共同进步。',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://blog.gooodh.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans', 'en'],
  },


  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
	  blogSidebarCount: 15, // 显示全部文章（或改成数字）
	  blogSidebarTitle: '所有博客', // 侧边栏标题
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // algolia: {
      //   appId: 'QWPDFETT0Z',
      //   apiKey: '0b0967de905f6bae9cad65c057231c9b',
      //   indexName: 'Blog',
      // },
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: '东方既白',
        logo: {
          alt: '东方既白',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/', label: '首页', position: 'left', activeBaseRegex: '^/$'},
          {to: '/blog', label: '博客', position: 'left'},
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '知识库',
          },
          {
            type: 'docSidebar',
            sidebarId: 'projectSidebar',
            position: 'left',
            label: '项目',
          },
          {
            href: 'https://github.com/dawnstaryrx/dawnstaryrx.github.io',
            label: 'GitHub',
            position: 'right',
            className: 'navbar-github-link',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文章',
            items: [
              {
                label: '博客',
                to: '/blog',
              },
              {
                label: '知识库',
                to: '/docs/knowledge/intro',
              },
              {
                label: '项目',
                to: '/docs/project/intro',
              },
            ],
          },
          {
            title: '社区',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/dawnstaryrx',
              },
              {
                label: '知乎',
                href: 'https://www.zhihu.com/people/zhilangxingchen',
              },
            ],
          },
          {
            title: '关注我',
            items: [
              {
                html: `
                  <img src="/img/follow.png" alt="关注我" style="width:300px; border-radius:8px;" />
                `,
              },
            ],
          },
          // {
          //   title: 'More',
          //   items: [
          //     {
          //       label: '博客',
          //       to: '/blog',
          //     },
          //     {
          //       label: 'GitHub',
          //       href: 'https://github.com/facebook/docusaurus',
          //     },
          //   ],
          // },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 东方既白. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
    plugins: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,           // 缓存索引文件，避免每次重建
        language: ['zh', 'en'], // 支持中英文搜索
        indexDocs: true,        // 索引文档
        indexBlog: true,        // 索引博客
        indexPages: true,       // 索引自定义页面
        highlightSearchTermsOnTargetPage: true, // 搜索结果页高亮关键字
      },
    ],
  ],
};

export default config;
