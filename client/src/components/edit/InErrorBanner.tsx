import React from 'react'
import { Box, Typography, Stack, Chip } from '@mui/material'
import { ReportProblem } from '@mui/icons-material'
import type { Auditable } from '@types'

interface InErrorBannerProps {
  entry: Auditable
  compact?: boolean
}

const InErrorBanner: React.FC<InErrorBannerProps> = ({ entry, compact }) => {
  if (!entry.markedInError) return null

  if (compact) {
    return (
      <Chip
        size="small"
        icon={<ReportProblem fontSize="small" />}
        label="IN ERROR"
        sx={{
          backgroundColor: '#fdecea',
          color: '#d32f2f',
          fontWeight: 700,
          fontSize: 10,
        }}
      />
    )
  }

  return (
    <Box
      sx={{
        backgroundColor: '#fdecea',
        border: '1px solid #d32f2f',
        borderRadius: 1,
        p: 1,
        my: 1,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <ReportProblem sx={{ color: '#d32f2f' }} fontSize="small" />
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          DOCUMENTED IN ERROR
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ display: 'block', color: '#666', mt: 0.5 }}>
        Reason: {entry.markedInErrorReason || '(no reason given)'}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: '#6B6B6B' }}>
        Flagged by {entry.markedInErrorBy} on{' '}
        {entry.markedInErrorAt ? new Date(entry.markedInErrorAt).toLocaleString() : '—'}
      </Typography>
    </Box>
  )
}

export const inErrorRowSx = (inError?: boolean) =>
  inError
    ? {
        textDecoration: 'line-through',
        opacity: 0.6,
        backgroundColor: '#fff8f8',
      }
    : {}

export default InErrorBanner
