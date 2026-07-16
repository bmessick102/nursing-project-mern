import React from 'react'
import { Box, Typography, Stack, Divider, Paper, Chip } from '@mui/material'
import { Groups } from '@mui/icons-material'
import type { PeerAssessment } from '@types'

interface PeerAssessmentListProps {
  assessments?: PeerAssessment[]
}

const PeerAssessmentList: React.FC<PeerAssessmentListProps> = ({ assessments }) => {
  if (!assessments || assessments.length === 0) return null

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ color: '#6B6B6B', fontWeight: 600 }}>
          PEER REVIEW ({assessments.length})
        </Typography>
      </Divider>
      <Stack spacing={1}>
        {assessments.map((a) => (
          <Paper
            key={a._id}
            variant="outlined"
            sx={{
              p: 1.5,
              backgroundColor: a.correct ? '#f1f8f2' : '#fff7ec',
              borderLeft: `4px solid ${a.correct ? '#2E7D32' : '#E68A00'}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Groups fontSize="small" sx={{ color: '#6B6B6B' }} />
              <Chip
                size="small"
                label={a.correct ? 'Correct' : 'Needs work'}
                sx={{
                  fontWeight: 600,
                  color: '#fff',
                  backgroundColor: a.correct ? '#2E7D32' : '#E68A00',
                }}
              />
              <Typography variant="caption" sx={{ color: '#6B6B6B' }}>
                {new Date(a.createdAt).toLocaleString()}
              </Typography>
            </Stack>
            {a.comment && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#333' }}>
                {a.comment}
              </Typography>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

export default PeerAssessmentList
