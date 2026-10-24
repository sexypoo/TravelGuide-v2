import styles from './loading.module.css';

export default function AdminMetricsLoading(): React.JSX.Element {
  return (
    <div className={styles.root} role="status" aria-busy="true">
      <span className="srOnly">운영 지표를 불러오는 중이에요</span>
      <div className={styles.header} aria-hidden="true">
        <span className={`${styles.block} ${styles.title}`} />
        <span className={`${styles.block} ${styles.copy}`} />
      </div>
      <div className={`${styles.block} ${styles.card}`} aria-hidden="true" />
      <div className={`${styles.block} ${styles.card}`} aria-hidden="true" />
      <div
        className={`${styles.block} ${styles.card} ${styles.cardShort}`}
        aria-hidden="true"
      />
    </div>
  );
}
