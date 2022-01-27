import styles from './header.module.scss';

export default function Header() {
  return (
    <div className={styles.content}>
      <img src="/images/Logo.png" alt="logo" />
    </div>
  );
}
