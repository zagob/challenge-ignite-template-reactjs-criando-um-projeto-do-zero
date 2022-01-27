import { GetStaticProps } from 'next';
import CardPost from '../components/CardPost';
import Header from '../components/Header';

import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';

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
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  results: Post[];
}

interface Prop {
  next_page: string | null;
  results: Post[];
}

// const results: {
//   next_page: string;
//   results: {
//       uid: string;
//       data: {
//           slug: string;
//           subtitle: any;
//           title: any;
//           author: any;
//       };
//       first_publication_date: string;
//   }[];
// }

export default function Home({ next_page, results }: Prop) {
  console.log('results', `${next_page}`);
  const [url, setUrl] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);

  console.log('post', posts);
  console.log('url', String(url));

  useEffect(() => {
    setPosts(results);
    setUrl(next_page);
  }, []);

  async function handleLoadPosts() {
    if (url === null) {
      return;
    }
    const request = new XMLHttpRequest();
    console.log(url);

    request.open('GET', `${url}`);

    request.onload = function () {
      const res = JSON.parse(this.responseText);
      console.log(res);
      setUrl(res.next_page);
      setPosts(old => [...old, ...res.results]);
    };

    request.onerror = function () {
      console.log('erro ao executar a requisição');
    };

    request.send();
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

      {url !== null && (
        <button
          type="button"
          className={styles.btnLoadPost}
          onClick={handleLoadPosts}
        >
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'blogpost')],
    {
      fetch: [
        'blogpost.next_page',
        'blogpost.results',
        'blogpost.uid',
        'blogpost.title',
        'blogpost.author',
        'blogpost.subtitle',
        'blogpost.content',
      ],
      pageSize: 1,
    }
  );

  // console.log(postsResponse);
  const data = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        data: {
          slug: post.uid,
          subtitle: post.data.subtitle,
          title: post.data.title,
          author: post.data.author,
        },
        first_publication_date: new Date(post.last_publication_date)
          .toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          .replace(/[de.]/g, ''),
      };
    }),
  };

  return {
    props: data,
    revalidate: 60,
  };
};
