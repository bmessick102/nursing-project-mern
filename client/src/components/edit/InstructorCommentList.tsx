import React from 'react'
import { Box, Typography, Stack, Divider, Paper } from '@mui/material'
import { RateReview } from '@mui/icons-material'
import type { InstructorComment } from '@types'

interface InstructorCommentListProps {
  comments?: InstructorComment[]
}

const InstructorCommentList: React.FC<InstructorCommentListProps> = ({ comments }) => {
  if (!comments || comments.length === 0) return null

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ color: '#6B6B6B', fontWeight: 600 }}>
          INSTRUCTOR FEEDBACK ({comments.length})
        </Typography>
      </Divider>
      <Stack spacing={1}>
        {comments.map((c) => (
          <Paper
            key={c._id}
            variant="outlined"
            sx={{ p: 1.5, backgroundColor: '#f5f8fc', borderLeft: '4px solid #003D82' }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <RateReview fontSize="small" sx={{ color: '#003D82' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#003D82' }}>
                {c.author}
                {c.authorRole ? ` (${c.authorRole})` : ''}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B6B6B' }}>
                {new Date(c.timestamp).toLocaleString()}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#333' }}>
              {c.content}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

export default InstructorCommentList
