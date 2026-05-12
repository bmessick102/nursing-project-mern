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
              href="https://www.instagram.com/cuwisconsin/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram fontSize="small" />
            </a>
            <a
              className={styles.socialIcon}
              href="https://www.youtube.com/c/cuwisconsin1881"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <YouTube fontSize="small" />
            </a>
            <a
              className={styles.socialIcon}
              href="https://www.linkedin.com/school/cuwisconsin/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <LinkedIn fontSize="small" />
            </a>
          </Box>
        </Box>

        <Box className={styles.column}>
          <Typography component="h4">Clinical References</Typography>
          <ul className={styles.linkList}>
            <li>
              <a href="https://nanda.org/" target="_blank" rel="noopener noreferrer">
                NANDA International
              </a>
            </li>
            <li>
              <a href="https://medlineplus.gov/" target="_blank" rel="noopener noreferrer">
                MedlinePlus Drug Info
              </a>
            </li>
            <li>
              <a
                href="https://www.cdc.gov/clinical-resources/index.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                CDC Clinical Resources
              </a>
            </li>
            <li>
              <a
                href="https://www.jointcommission.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                The Joint Commission
              </a>
            </li>
            <li>
              <a
                href="https://www.ncsbn.org/exams/nclex.page"
                target="_blank"
                rel="noopener noreferrer"
              >
                NCSBN NCLEX
              </a>
            </li>
          </ul>
        </Box>

        <Box className={styles.column}>
          <Typography component="h4">Academics</Typography>
          <ul className={styles.linkList}>
            <li>
              <a
                href="https://www.cuw.edu/academics/schools/nursing/"
                target="_blank"
                rel="noopener noreferrer"
              >
                School of Nursing
              </a>
            </li>
            <li>
              <a href="https://catalog.cuw.edu/" target="_blank" rel="noopener noreferrer">
                Course Catalog
              </a>
            </li>
            <li>
              <a
                href="https://www.cuw.edu/academics/services/student-academic-resources/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Academic Resources
              </a>
            </li>
            <li>
              <a
                href="https://www.cuw.edu/students/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Student Resources
              </a>
            </li>
            <li>
              <a
                href="https://www.cuw.edu/facultystaff/lookup.cfm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Faculty Directory
              </a>
            </li>
          </ul>
        </Box>

        <Box className={styles.column}>
          <Typography component="h4">Support</Typography>
          <ul className={styles.linkList}>
            <li>
              <a
                href="https://www.cuw.edu/academics/services/technology-services/helpdesk.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                IT Helpdesk
              </a>
            </li>
            <li>
              <a
                href="https://www.cuw.edu/academics/services/technology-services/index.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Technology Services
              </a>
            </li>
            <li>
              <a
                href="https://www.cuw.edu/about/offices/compliance/privacy-policy/index.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="https://www.hhs.gov/hipaa/index.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                HIPAA (HHS.gov)
              </a>
            </li>
            <li>
              <a
                href="https://www.cuw.edu/academics/services/student-academic-resources/academic-resource-center/accessibility-services/rights-responsiblities.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Accessibility Services
              </a>
            </li>
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
