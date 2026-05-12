import React from 'react'
import { Paper, Box, Typography } from '@mui/material'
import styles from 'styles/TabContent.module.css'

interface EmptyStateProps {
  message: string
  actionHint?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, actionHint }) => {
  return (
    <Paper className={styles.section}>
      <Box className={styles.emptyState}>
        <Typography variant="body2">{message}</Typography>
        {actionHint && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#999' }}>
            {actionHint}
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

export default EmptyState
