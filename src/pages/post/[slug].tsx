import { GetStaticPaths, GetStaticProps } from 'next';
import { FiUser } from 'react-icons/fi';
import { HiOutlineCalendar } from 'react-icons/hi';
import { BiTime } from 'react-icons/bi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post() {
  return (
    <>
      <Header />
      <main>
        <img src="/images/Banner.png" alt="banner" />

        <article className={styles.article}>
          <h1>Criando um app CRA do zero</h1>
          <div className={styles.info}>
            <time>
              <HiOutlineCalendar />
              15 Mai 2021
            </time>
            <span>
              <FiUser /> Joseph Oliveira
            </span>

            <span>
              <BiTime />4 min
            </span>
          </div>

          <div>artigo</div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'blogpost')],
    {
      fetch: [
        'blogpost.next_page',
        'blogpost.results',
        'blogpost.uid',
        'blogpost.title',
        'blogpost.author',
        'blogpost.subtitle',
        'blogpost.slug',
        'blogpost.content',
      ],
      pageSize: 1,
    }
  );

  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('blogpost', String(slug), {});
  console.log(response);
  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  };
  console.log(post)
  return {
    props: {
      data: 1,
    },
    revalidate: 60,
  };
};
