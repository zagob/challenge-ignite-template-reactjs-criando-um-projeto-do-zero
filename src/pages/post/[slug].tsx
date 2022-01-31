import { GetStaticPaths, GetStaticProps } from 'next';
import { FiUser } from 'react-icons/fi';
import { HiOutlineCalendar } from 'react-icons/hi';
import { BiTime } from 'react-icons/bi';
import Header from '../../components/Header';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';

interface NavigationPosts {
  title: string;
  uid: string;
}

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
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
  preview: boolean;
  navigation: {
    nextPost: NavigationPosts | null;
    previousPost: NavigationPosts | null;
  };
}

export default function Post({ post }: PostProps) {
  console.log('post', post);

  const postTime = {
    first_publication_date: post.first_publication_date
      ? format(new Date(post.first_publication_date), 'dd MMM yyyy', {
          locale: ptBR,
        })
      : '',
  };
  return (
    <>
      <Header />
      <main className={styles.main}>
        <img src={post.data.banner.url} alt="banner" />

        <article className={styles.article}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <time>
              <HiOutlineCalendar />
              {postTime.first_publication_date}
            </time>
            <span>
              <FiUser /> {post.data.author}
            </span>

            <span>
              <BiTime />4 min
            </span>
          </div>

          <div>
            {post.data.content.map(({ heading, body }) => (
              <div key={heading}>
                {heading && <h2>{heading}</h2>}

                <div
                  className={styles.postSection}
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
                />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    { pageSize: 3 }
  );

  const paths = posts.results.map(result => {
    return {
      params: {
        slug: result.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('blogpost', String(slug), {
    ref: previewData?.ref || null,
  });

  const previousPostResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'blogpost')],
    {
      fetch: ['blogpost.title'],
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const nextPostResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'blogpost')],
    {
      fetch: ['blogpost.title'],
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
      preview,
      navigation: {
        previousPost: previousPostResponse?.results[0]
          ? {
              title: previousPostResponse?.results[0].data.title,
              uid: previousPostResponse?.results[0].uid,
            }
          : null,
        nextPost: nextPostResponse?.results[0]
          ? {
              title: nextPostResponse?.results[0].data.title,
              uid: nextPostResponse?.results[0].uid,
            }
          : null,
      },
    },
    revalidate: 60 * 30, // 30 minutos
  };
};
