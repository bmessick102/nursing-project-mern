import React from 'react'
import { Box, Typography } from '@mui/material'
import {
  Facebook,
  Instagram,
  YouTube,
  LinkedIn,
  Twitter,
} from '@mui/icons-material'
import styles from 'styles/Footer.module.css'

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <Box className={styles.footerInner}>
        <Box className={styles.brand}>
          <Box className={styles.brandLogo}>
            <img src="/images/logo.jpg" alt="Concordia University Wisconsin · School of Nursing" />
          </Box>
          <address className={styles.address}>
            12800 N Lake Shore Drive
            <br />
            Mequon, WI 53097
            <br />
            <a href="tel:2622435700">262-243-5700</a>
            <br />
            <a href="mailto:admissions@cuw.edu">admissions@cuw.edu</a>
          </address>
          <Box className={styles.social} aria-label="Social media">
            <a
              className={styles.socialIcon}
              href="https://www.facebook.com/CUWisconsin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <Facebook fontSize="small" />
            </a>
            <a
              className={styles.socialIcon}
              href="https://twitter.com/CUWisconsin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Twitter fontSize="small" />
            </a>
            <a
              className={styles.socialIcon}
              href="https://www.instagram.com/cuwisconsin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram fontSize="small" />
            </a>
            <a
              className={styles.socialIcon}
              href="https://www.youtube.com/cuwisconsin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <YouTube fontSize="small" />
            </a>
            <a
              className={styles.socialIcon}
              href="https://www.linkedin.com/school/concordia-university-wisconsin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <LinkedIn fontSize="small" />
            </a>
          </Box>
        </Box>

        <Box className={styles.column}>
          <Typography component="h4">Charting</Typography>
          <ul className={styles.linkList}>
            <li><a href="https://www.cuw.edu" target="_blank" rel="noopener noreferrer">Patient Summary</a></li>
            <li><a href="https://www.cuw.edu" target="_blank" rel="noopener noreferrer">Chart Review</a></li>
            <li><a href="https://www.cuw.edu" target="_blank" rel="noopener noreferrer">Results &amp; Labs</a></li>
            <li><a href="https://www.cuw.edu" target="_blank" rel="noopener noreferrer">MAR</a></li>
            <li><a href="https://www.cuw.edu" target="_blank" rel="noopener noreferrer">Flowsheets</a></li>
          </ul>
        </Box>

        <Box className={styles.column}>
          <Typography component="h4">Academics</Typography>
          <ul className={styles.linkList}>
            <li><a href="https://www.cuw.edu/academics/schools/nursing/" target="_blank" rel="noopener noreferrer">School of Nursing</a></li>
            <li><a href="https://www.cuw.edu/academics/" target="_blank" rel="noopener noreferrer">Course Catalog</a></li>
            <li><a href="https://www.cuw.edu/academics/schools/nursing/" target="_blank" rel="noopener noreferrer">Clinical Resources</a></li>
            <li><a href="https://www.cuw.edu/students/" target="_blank" rel="noopener noreferrer">Student Handbook</a></li>
            <li><a href="https://www.cuw.edu/about/directory/" target="_blank" rel="noopener noreferrer">Faculty Directory</a></li>
          </ul>
        </Box>

        <Box className={styles.column}>
          <Typography component="h4">Support</Typography>
          <ul className={styles.linkList}>
            <li><a href="https://www.cuw.edu" target="_blank" rel="noopener noreferrer">Help Center</a></li>
            <li><a href="https://www.cuw.edu" target="_blank" rel="noopener noreferrer">IT Support</a></li>
            <li><a href="https://www.cuw.edu" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
            <li><a href="https://www.cuw.edu" target="_blank" rel="noopener noreferrer">HIPAA Notice</a></li>
            <li><a href="https://www.cuw.edu" target="_blank" rel="noopener noreferrer">Accessibility</a></li>
          </ul>
        </Box>
      </Box>

      <Box className={styles.bottomBar}>
        <Box className={styles.bottomInner}>
          <span>&copy; {new Date().getFullYear()} Concordia University Wisconsin</span>
          <span className={styles.tagline}>Live Uncommon</span>
          <span>Nursing Charting System v2.0</span>
        </Box>
      </Box>
    </footer>
  )
}

export default Footer
