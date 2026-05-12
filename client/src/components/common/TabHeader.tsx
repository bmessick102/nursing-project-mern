import React from 'react'
import { Box, Typography, Button, Stack } from '@mui/material'
import { Add } from '@mui/icons-material'

interface TabHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
  actionIcon?: React.ReactNode
  rightSlot?: React.ReactNode
}

const TabHeader: React.FC<TabHeaderProps> = ({
  title,
  actionLabel,
  onAction,
  actionIcon,
  rightSlot,
}) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        mb: 2,
        pb: 1.5,
        borderBottom: '2px solid #FFB81C',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: '#003D82',
          fontFamily: '"Merriweather", Georgia, serif',
          fontWeight: 700,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </Typography>
      <Box>
        {rightSlot}
        {actionLabel && onAction && (
          <Button
            variant="contained"
            startIcon={actionIcon ?? <Add />}
            onClick={onAction}
            sx={{
              backgroundColor: '#003D82',
              '&:hover': { backgroundColor: '#002759' },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Stack>
  )
}

export default TabHeader
