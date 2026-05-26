import React from 'react'
import { Box } from '@mui/material'
import styles from 'styles/UtilityBar.module.css'

interface UtilityBarProps {
  showLogout?: boolean
  onLogout?: () => void
  onChangePatient?: () => void
}

const UtilityBar: React.FC<UtilityBarProps> = ({
  showLogout = false,
  onLogout,
  onChangePatient,
}) => {
  return (
    <Box className={styles.utilityBar}>
      <Box className={styles.utilityInner}>
        <span className={styles.tagline}>Live Uncommon</span>
        <Box className={styles.linkGroup}>
          <a
            className={styles.link}
            href="https://my.cuw.edu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Faculty &amp; Staff
          </a>
          <span className={styles.divider} />
          <a
            className={styles.link}
            href="https://www.cuw.edu/students/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Students
          </a>
          <span className={styles.divider} />
          <a
            className={styles.link}
            href="https://www.cuw.edu/academics/services/technology-services/helpdesk.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Help
          </a>
          <span className={styles.divider} />
          <a
            className={styles.link}
            href="https://www.cuw.edu/facultystaff/lookup.cfm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Directory
          </a>
          {showLogout && onChangePatient && (
            <>
              <span className={styles.divider} />
              <button className={styles.link} onClick={onChangePatient}>
                Change Patient
              </button>
            </>
          )}
          {showLogout && onLogout && (
            <>
              <span className={styles.divider} />
              <button className={styles.link} onClick={onLogout}>
                Sign Out
              </button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default UtilityBar
