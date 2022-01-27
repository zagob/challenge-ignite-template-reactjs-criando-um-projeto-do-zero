import styles from './cardpost.module.scss';

import { HiOutlineCalendar } from 'react-icons/hi';
import { FiUser } from 'react-icons/fi';

interface Post {
  uid: string;
  title: string;
  subtitle: string;
  first_publication_date: string;
  author: string;
}

export default function CardPost({
  uid,
  title,
  subtitle,
  first_publication_date,
  author,
}: Post) {
  return (
    <section className={styles.content} key={uid}>
      <h2>{title}</h2>
      <span className={styles.subTitle}>{subtitle}</span>

      <div className={styles.info}>
        <time>
          <HiOutlineCalendar />
          {first_publication_date}
        </time>
        <span>
          <FiUser /> {author}
        </span>
      </div>
    </section>
  );
}
