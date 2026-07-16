import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useChartingApi } from 'hooks/useChartingApi'

type PeerReviewItem = { _id: string; status: string; createdAt: string }

const PeerReviewListPage: React.FC = () => {
  const navigate = useNavigate()
  const { listMyPeerReviews } = useChartingApi()
  const [items, setItems] = useState<PeerReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const data = await listMyPeerReviews()
        if (active) setError(null)
        if (active) setItems(data)
      } catch (err) {
        console.error('Failed to load peer reviews:', err)
        if (active) setError('Failed to load peer reviews.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [listMyPeerReviews])

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#003D82' }}>
          Peer Reviews
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/patients')}>
          Back to Roster
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Alert severity="info">No peer reviews assigned.</Alert>
      ) : (
        <Stack spacing={2}>
          {items.map((item, idx) => (
            <Paper
              key={item._id}
              variant="outlined"
              sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Assignment {idx + 1}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B6B6B' }}>
                  {new Date(item.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={item.status}
                color={item.status === 'submitted' ? 'success' : 'warning'}
                variant={item.status === 'submitted' ? 'filled' : 'outlined'}
                sx={{ textTransform: 'capitalize' }}
              />
              <Button
                variant="contained"
                onClick={() => navigate('/peer-review/' + item._id)}
                sx={{ backgroundColor: '#003D82' }}
              >
                Open
              </Button>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  )
}

export default PeerReviewListPage
