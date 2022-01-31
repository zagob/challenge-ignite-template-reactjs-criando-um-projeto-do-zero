import styles from './header.module.scss';
import Link from 'next/link';

export default function Header() {
  return (
    <div className={styles.content}>
      <Link href="/">
        <img src="/images/Logo.png" alt="logo" />
      </Link>
    </div>
  );
}
