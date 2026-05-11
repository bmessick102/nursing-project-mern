import React from 'react'
import { Box } from '@mui/material'
import { Favorite, Groups, MenuBook } from '@mui/icons-material'
import styles from 'styles/PillarCards.module.css'

const PillarCards: React.FC = () => {
  return (
    <Box className={styles.pillarSection}>
      <Box className={styles.pillarHeader}>
        <span className={styles.pillarEyebrow}>The CUW Way</span>
        <h2 className={styles.pillarTitle}>A Passion for Healing</h2>
        <p className={styles.pillarSubtitle}>
          A rigorous Christ-centered education preparing nurses to serve.
        </p>
      </Box>
      <Box className={styles.pillarGrid}>
        <Box className={styles.pillarCard}>
          <Box className={styles.pillarIcon}>
            <Favorite />
          </Box>
          <h3 className={styles.pillarCardTitle}>Faith</h3>
          <p className={styles.pillarCardText}>
            Compassionate care rooted in service to others.
          </p>
        </Box>
        <Box className={styles.pillarCard}>
          <Box className={styles.pillarIcon}>
            <Groups />
          </Box>
          <h3 className={styles.pillarCardTitle}>Community</h3>
          <p className={styles.pillarCardText}>
            A supportive cohort and 11:1 student-to-faculty ratio.
          </p>
        </Box>
        <Box className={styles.pillarCard}>
          <Box className={styles.pillarIcon}>
            <MenuBook />
          </Box>
          <h3 className={styles.pillarCardTitle}>Excellence</h3>
          <p className={styles.pillarCardText}>
            Rigorous clinical training and a brand-new nursing wing.
          </p>
        </Box>
      </Box>
    </Box>
  )
}

export default PillarCards
