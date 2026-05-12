import React from 'react'
import { Box, Typography, Stack, Divider, Paper } from '@mui/material'
import { Comment } from '@mui/icons-material'
import type { Addendum } from '@types'

interface AddendaListProps {
  addenda?: Addendum[]
}

const AddendaList: React.FC<AddendaListProps> = ({ addenda }) => {
  if (!addenda || addenda.length === 0) return null

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
          ADDENDA ({addenda.length})
        </Typography>
      </Divider>
      <Stack spacing={1}>
        {addenda.map((a) => (
          <Paper
            key={a._id}
            variant="outlined"
            sx={{ p: 1.5, backgroundColor: '#fafbfc', borderLeft: '4px solid #FFB81C' }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Comment fontSize="small" sx={{ color: '#FFB81C' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#003D82' }}>
                Addendum
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                {new Date(a.timestamp).toLocaleString()} — {a.author}
                {a.authorRole ? ` (${a.authorRole})` : ''}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#333' }}>
              {a.content}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

export default AddendaList
