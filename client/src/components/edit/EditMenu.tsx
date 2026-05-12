import React, { useState } from 'react'
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Chip } from '@mui/material'
import {
  MoreVert,
  Edit as EditIcon,
  Comment as CommentIcon,
  ReportProblem,
  History as HistoryIcon,
  Block,
} from '@mui/icons-material'
import type { Auditable } from '@types'

interface EditMenuProps {
  entry: Auditable
  signed?: boolean
  onEdit?: () => void
  onAddendum?: () => void
  onMarkInError?: () => void
  onViewHistory?: () => void
}

const EditMenu: React.FC<EditMenuProps> = ({
  entry,
  signed,
  onEdit,
  onAddendum,
  onMarkInError,
  onViewHistory,
}) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const open = Boolean(anchor)
  const inError = !!entry.markedInError
  const hasHistory = (entry.modifications?.length || 0) > 0
  const hasAddenda = (entry.addenda?.length || 0) > 0

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setAnchor(e.currentTarget)
  }

  const close = () => setAnchor(null)

  const wrap = (fn?: () => void) => () => {
    close()
    fn?.()
  }

  return (
    <>
      <IconButton size="small" onClick={handleClick} aria-label="modify">
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        onClick={(e) => e.stopPropagation()}
      >
        {inError ? (
          <MenuItem disabled>
            <ListItemIcon>
              <Block fontSize="small" />
            </ListItemIcon>
            <ListItemText>Documented in error (read-only)</ListItemText>
          </MenuItem>
        ) : signed ? (
          onAddendum && (
            <MenuItem onClick={wrap(onAddendum)}>
              <ListItemIcon>
                <CommentIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                Add Addendum {hasAddenda ? <Chip size="small" label={entry.addenda!.length} sx={{ ml: 1 }} /> : null}
              </ListItemText>
            </MenuItem>
          )
        ) : (
          onEdit && (
            <MenuItem onClick={wrap(onEdit)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
          )
        )}

        {!inError && onMarkInError && (
          <MenuItem onClick={wrap(onMarkInError)}>
            <ListItemIcon>
              <ReportProblem fontSize="small" sx={{ color: '#d32f2f' }} />
            </ListItemIcon>
            <ListItemText>Mark in Error</ListItemText>
          </MenuItem>
        )}

        {hasHistory && onViewHistory && (
          <MenuItem onClick={wrap(onViewHistory)}>
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              View History <Chip size="small" label={entry.modifications!.length} sx={{ ml: 1 }} />
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

export default EditMenu
