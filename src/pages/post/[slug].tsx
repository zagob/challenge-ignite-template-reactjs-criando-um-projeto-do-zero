import { GetStaticPaths, GetStaticProps } from 'next';
import { FiUser } from 'react-icons/fi';
import { HiOutlineCalendar } from 'react-icons/hi';
import { BiTime } from 'react-icons/bi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

// export const getStaticProps = async context => {
//   const prismic = getPrismicClient();
//   const response = await prismic.getByUID(TODO);

//   // TODO
// };
