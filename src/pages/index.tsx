import { GetStaticProps } from 'next';
import CardPost from '../components/CardPost';
import Header from '../components/Header';

import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';
import { useEffect, useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    slug: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  console.log('preview',preview)
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState<string>('');

  useEffect(() => {
    setPosts(
      postsPagination.results.map((post: Post) => {
        return {
          ...post,
          first_publication_date: format(
            new Date(post.first_publication_date),
            'dd MMM yyyy',
            { locale: ptBR }
          ),
        };
      })
    );
    setNextPage(postsPagination.next_page);
  }, [postsPagination.results, postsPagination.next_page]);

  function handlePagination(): void {
    fetch(
      `${nextPage}&access_token=${process.env.PRISMIC_API_ENDPOINT}`
    )
      .then(res => res.json())
      .then(data => {
        const formattedData = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              { locale: ptBR }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...formattedData]);
        setNextPage(data.next_page);
      });
  }
  return (
    <main className={styles.content}>
      <Header />
      {posts.map(post => (
        <div key={post.uid}>
          <CardPost
            uid={post.uid}
            title={post.data.title}
            subtitle={post.data.subtitle}
            first_publication_date={post.first_publication_date}
            author={post.data.author}
          />
        </div>
      ))}

      {nextPage && (
        <button
          type="button"
          className={styles.btnLoadPost}
          onClick={handlePagination}
        >
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'blogpost')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 2,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  // const postsResponse = await prismic.query(
  //   [Prismic.predicates.at('document.type', 'blogpost')],
  //   {
  //     fetch: [
  //       'blogpost.next_page',
  //       'blogpost.results',
  //       'blogpost.uid',
  //       'blogpost.title',
  //       'blogpost.author',
  //       'blogpost.subtitle',
  //       'blogpost.slug',
  //       'blogpost.content',
  //     ],
  //     pageSize: 1,
  //   }
  // );

  // const data = {
  //   next_page: postsResponse.next_page,
  //   results: postsResponse.results.map(post => {
  //     return {
  //       uid: post.uid,
  //       data: {
  //         slug: post.uid,
  //         subtitle: post.data.subtitle,
  //         title: post.data.title,
  //         author: post.data.author,
  //       },
  //       first_publication_date: new Date(post.last_publication_date)
  //         .toLocaleDateString('pt-BR', {
  //           day: '2-digit',
  //           month: 'short',
  //           year: 'numeric',
  //         })
  //         .replace(/[de.]/g, ''),
  //     };
  //   }),
  // };

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      },
      preview,
    },
  };
};
