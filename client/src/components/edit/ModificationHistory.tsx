import React from 'react'
import {
  Drawer,
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  IconButton,
  Paper,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import type { Auditable } from '@types'

interface ModificationHistoryProps {
  open: boolean
  onClose: () => void
  entry: Auditable | null
  entityLabel?: string
}

const fieldRow = (key: string, before: unknown, after: unknown) => {
  const beforeStr = typeof before === 'object' ? JSON.stringify(before) : String(before ?? '')
  const afterStr = typeof after === 'object' ? JSON.stringify(after) : String(after ?? '')
  if (beforeStr === afterStr) return null
  return (
    <Box key={key} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 0.5 }}>
      <Box sx={{ fontSize: 12 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {key}
        </Typography>
        <Box sx={{ backgroundColor: '#fee', color: '#a00', p: 0.5, borderRadius: 0.5 }}>
          {beforeStr || '(empty)'}
        </Box>
      </Box>
      <Box sx={{ fontSize: 12 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          → after
        </Typography>
        <Box sx={{ backgroundColor: '#efe', color: '#080', p: 0.5, borderRadius: 0.5 }}>
          {afterStr || '(empty)'}
        </Box>
      </Box>
    </Box>
  )
}

const ModificationHistory: React.FC<ModificationHistoryProps> = ({
  open,
  onClose,
  entry,
  entityLabel = 'entry',
}) => {
  const modifications = entry?.modifications || []

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 480, p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Modification History
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 2 }}>
          {modifications.length} prior version{modifications.length === 1 ? '' : 's'} of this {entityLabel}.
          Most recent first.
        </Typography>

        {modifications.length === 0 && (
          <Typography variant="body2" sx={{ color: '#999' }}>
            No prior versions.
          </Typography>
        )}

        <Stack spacing={2}>
          {[...modifications].reverse().map((mod, idx) => {
            const current = idx === 0 ? entry : modifications[modifications.length - idx]?.previousSnapshot
            const prev = mod.previousSnapshot
            const keys = Array.from(
              new Set([
                ...Object.keys(prev || {}),
                ...Object.keys((current as Record<string, unknown>) || {}),
              ]),
            ).filter(
              (k) =>
                ![
                  '_id',
                  'modifications',
                  'lastModifiedAt',
                  'lastModifiedBy',
                  'addenda',
                  'markedInError',
                  'markedInErrorReason',
                  'markedInErrorBy',
                  'markedInErrorAt',
                ].includes(k),
            )

            return (
              <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Chip
                    size="small"
                    label={`Version ${modifications.length - idx}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {new Date(mod.modifiedAt).toLocaleString()} by {mod.modifiedBy}
                  </Typography>
                </Stack>
                {mod.reason && (
                  <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', color: '#555' }}>
                    Reason: {mod.reason}
                  </Typography>
                )}
                <Divider sx={{ mb: 1 }} />
                {keys.map((k) =>
                  fieldRow(k, prev?.[k], (current as Record<string, unknown>)?.[k]),
                )}
              </Paper>
            )
          })}
        </Stack>
      </Box>
    </Drawer>
  )
}

export default ModificationHistory
