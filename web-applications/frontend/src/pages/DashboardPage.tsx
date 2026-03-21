import { useEffect, useMemo, useState } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import LogoutIcon from '@mui/icons-material/Logout'
import AddIcon from '@mui/icons-material/Add'
import FilterListIcon from '@mui/icons-material/FilterList'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DownloadIcon from '@mui/icons-material/Download'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import ImageIcon from '@mui/icons-material/Image'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'

import { ApiError, apiFetch } from '../lib/api'
import type { Attachment, Task, TaskPriority, TaskStatus } from '../lib/types'

const drawerWidth = 208

interface SortConfig {
  field: keyof Task | 'due'
  direction: 'asc' | 'desc'
}

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'high' as TaskPriority,
    status: 'pending' as TaskStatus,
  })

  const [filterOpen, setFilterOpen] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<Record<TaskPriority, boolean>>({
    low: false,
    medium: false,
    high: false,
    urgent: false,
  })
  const [statusFilter, setStatusFilter] = useState<Record<TaskStatus, boolean>>({
    pending: false,
    in_progress: false,
    completed: false,
  })

  const [sort, setSort] = useState<SortConfig>({ field: 'title', direction: 'asc' })

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailData, setDetailData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'high' as TaskPriority,
    status: 'pending' as TaskStatus,
  })
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [uploading, setUploading] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleSelectAll = (allIds: string[]) => {
    setSelectedIds(prev => {
      if (prev.size === allIds.length) return new Set()
      return new Set(allIds)
    })
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Delete ${selectedIds.size} tasks?`)) return
    try {
      await apiFetch('/tasks/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      setTasks(prev => prev ? prev.filter(t => !selectedIds.has(t.id)) : prev)
      setSelectedIds(new Set())
      setToast('Tasks deleted.')
    } catch {
      setToast('Failed to delete tasks.')
    }
  }

  async function handleBulkUpdate(updates: Partial<Task>) {
    if (selectedIds.size === 0) return
    try {
      await apiFetch('/tasks/bulk', {
        method: 'PATCH',
        body: JSON.stringify({ ids: Array.from(selectedIds), updates }),
      })
      setTasks(prev => prev ? prev.map(t => selectedIds.has(t.id) ? { ...t, ...updates } : t) : prev)
      setSelectedIds(new Set())
      setToast('Tasks updated.')
    } catch {
      setToast('Failed to update tasks.')
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      window.location.href = '/login'
      return
    }
    let cancelled = false
    void apiFetch<Task[]>('/tasks')
      .then(data => {
        if (!cancelled) setTasks(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          setToast('Please sign in again.')
          window.location.href = '/login'
        } else {
          setToast('Failed to load tasks.')
        }
        setTasks([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredSortedTasks = useMemo(() => {
    if (!tasks) return null
    
    let list = [...tasks]

    // Filter
    const activePriority = Object.entries(priorityFilter).filter(([, v]) => v).map(([k]) => k as TaskPriority)
    const activeStatus = Object.entries(statusFilter).filter(([, v]) => v).map(([k]) => k as TaskStatus)

    if (activePriority.length) list = list.filter(t => activePriority.includes(t.priority))
    if (activeStatus.length) list = list.filter(t => activeStatus.includes(t.status))

    // Sort
    list.sort((a, b) => {
      let av = (a[sort.field as keyof Task] ?? '') as string | number
      let bv = (b[sort.field as keyof Task] ?? '') as string | number
      
      if (sort.field === 'due') {
        av = a.dueDate ? new Date(a.dueDate).getTime() : 0
        bv = b.dueDate ? new Date(b.dueDate).getTime() : 0
      }

      if (av < bv) return sort.direction === 'asc' ? -1 : 1
      if (av > bv) return sort.direction === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [tasks, priorityFilter, statusFilter, sort])

  const handleSort = (field: keyof Task | 'due') => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  async function handleSaveTask() {
    if (!formData.title.trim()) return
    try {
      const method = editingTask ? 'PATCH' : 'POST'
      const url = editingTask ? `/tasks/${editingTask.id}` : '/tasks'
      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        dueDate: formData.dueDate || undefined,
      }

      const res = await apiFetch<Task>(url, {
        method,
        body: JSON.stringify(payload),
      })

      setTasks(prev => {
        if (!prev) return [res]
        if (editingTask) return prev.map(t => t.id === editingTask.id ? res : t)
        return [res, ...prev]
      })

      setCreateOpen(false)
      setEditingTask(null)
      setFormData({ title: '', description: '', dueDate: '', priority: 'high', status: 'pending' })
      setToast(editingTask ? 'Task updated.' : 'Task created.')
    } catch {
      setToast('Failed to save task.')
    }
  }

  async function toggleTaskComplete(task: Task) {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      const updated = await apiFetch<Task>(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })
      setTasks(prev => prev ? prev.map(t => t.id === task.id ? updated : t) : prev)
    } catch {
      setToast('Failed to update task status.')
    }
  }

  async function deleteTask(taskId: string) {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' })
      setTasks(prev => prev ? prev.filter(t => t.id !== taskId) : prev)
      setToast('Task deleted.')
    } catch {
      setToast('Failed to delete task.')
    }
  }

  const handleOpenEdit = (task: Task) => {
    setSelectedTask(task)
    setDetailData({
      title: task.title,
      description: task.description ?? '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority,
      status: task.status,
    })
    setDetailOpen(true)
  }

  async function handleUpdateTask() {
    if (!selectedTask || !detailData.title.trim()) return
    try {
      const payload = {
        ...detailData,
        title: detailData.title.trim(),
        description: detailData.description.trim() || null,
        dueDate: detailData.dueDate || null,
      }

      const res = await apiFetch<Task>(`/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      setTasks(prev => prev ? prev.map(t => t.id === selectedTask.id ? res : t) : prev)
      setSelectedTask(res)
      setToast('Task updated.')
    } catch {
      setToast('Failed to update task.')
    }
  }

  async function handleAddSubtask() {
    if (!selectedTask || !newSubtaskTitle.trim()) return
    try {
      const res = await apiFetch<Task>(`/tasks/${selectedTask.id}/subtasks`, {
        method: 'POST',
        body: JSON.stringify({ title: newSubtaskTitle.trim() }),
      })
      setTasks(prev => prev ? prev.map(t => t.id === selectedTask.id ? res : t) : prev)
      setSelectedTask(res)
      setNewSubtaskTitle('')
    } catch {
      setToast('Failed to add subtask.')
    }
  }

  async function toggleSubtask(subtaskId: string, currentStatus: boolean) {
    if (!selectedTask) return
    try {
      const res = await apiFetch<Task>(`/tasks/${selectedTask.id}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isCompleted: !currentStatus }),
      })
      setTasks(prev => prev ? prev.map(t => t.id === selectedTask.id ? res : t) : prev)
      setSelectedTask(res)
    } catch {
      setToast('Failed to update subtask.')
    }
  }

  async function deleteSubtask(subtaskId: string) {
    if (!selectedTask) return
    try {
      const res = await apiFetch<Task>(`/tasks/${selectedTask.id}/subtasks/${subtaskId}`, {
        method: 'DELETE',
      })
      setTasks(prev => prev ? prev.map(t => t.id === selectedTask.id ? res : t) : prev)
      setSelectedTask(res)
    } catch {
      setToast('Failed to delete subtask.')
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!selectedTask || !file) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await apiFetch<Attachment>(`/tasks/${selectedTask.id}/attachments`, {
        method: 'POST',
        body: formData,
      })
      const updatedTask = {
        ...selectedTask,
        attachments: [...(selectedTask.attachments ?? []), res]
      }
      setTasks(prev => prev ? prev.map(t => t.id === selectedTask.id ? updatedTask : t) : prev)
      setSelectedTask(updatedTask)
      setToast('File uploaded.')
    } catch {
      setToast('Failed to upload file.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleFileDelete(id: string) {
    if (!selectedTask) return
    try {
      await apiFetch(`/tasks/attachments/${id}`, { method: 'DELETE' })
      const updatedTask = {
        ...selectedTask,
        attachments: (selectedTask.attachments ?? []).filter(a => a.id !== id)
      }
      setTasks(prev => prev ? prev.map(t => t.id === selectedTask.id ? updatedTask : t) : prev)
      setSelectedTask(updatedTask)
      setToast('File deleted.')
    } catch {
      setToast('Failed to delete file.')
    }
  }

  function handleFileDownload(url: string, filename: string) {
    const link = document.createElement('a')
    link.href = `${import.meta.env.VITE_API_BASE}${url}`
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <ImageIcon fontSize="small" sx={{ color: '#8B5CF6' }} />
    if (mimetype === 'application/pdf') return <PictureAsPdfIcon fontSize="small" sx={{ color: '#EF4444' }} />
    return <InsertDriveFileIcon fontSize="small" sx={{ color: '#64748B' }} />
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, bgcolor: 'white' }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 5, pb: 4, borderBottom: '1px solid #E2E8F0' }}>
        <Box sx={{ width: 32, height: 32, bgcolor: '#2563EB', borderRadius: 1.5, display: 'grid', placeItems: 'center', color: 'white' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 14V2l5 7V2h7v12l-5-7v7H2z" fill="currentColor" />
          </svg>
        </Box>
        <Typography variant="h6" fontWeight={800} sx={{ color: '#0F172A' }}>NavTask</Typography>
      </Stack>

      <Stack alignItems="center" spacing={1.5} sx={{ mb: 5, pb: 4, borderBottom: '1px solid #E2E8F0' }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: '#F1F5F9', color: '#94A3B8', border: '2px solid #E2E8F0' }}>
          <Typography variant="h5">JD</Typography>
        </Avatar>
        <Typography variant="body2" fontWeight={600} color="#334155">Jhon Doe_456</Typography>
      </Stack>

      <List disablePadding sx={{ flex: 1 }}>
        <ListItemButton sx={{ borderRadius: 2, bgcolor: '#EFF6FF', color: '#1D4ED8', mb: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><HomeIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Home" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 700 }} />
        </ListItemButton>
        <ListItemButton sx={{ borderRadius: 2, color: '#475569' }} onClick={() => { localStorage.removeItem('access_token'); window.location.href = '/login' }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Sign out" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </ListItemButton>
      </List>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F1F5F9', display: 'flex' }}>
      {/* Mobile AppBar */}
      <AppBar position="fixed" elevation={0} sx={{ display: { md: 'none' }, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', color: '#0F172A' }}>
        <Toolbar sx={{ minHeight: 56, px: 2, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 32, height: 32, bgcolor: '#2563EB', borderRadius: 1.5, display: 'grid', placeItems: 'center', color: 'white' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 14V2l5 7V2h7v12l-5-7v7H2z" fill="currentColor" />
              </svg>
            </Box>
            <Typography variant="h6" fontWeight={800}>NavTask</Typography>
          </Stack>
          <IconButton edge="end" onClick={() => setMobileOpen(true)} sx={{ color: '#64748B' }}><MenuIcon /></IconButton>
        </Toolbar>
      </AppBar>

      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 'none' } }}>{drawer}</Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #E2E8F0' } }} open>{drawer}</Drawer>

      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 }, mt: { xs: 7, md: 0 } }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#1E293B', mb: 3 }}>To-do</Typography>

        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #F1F5F9' }}>
            <Button variant="outlined" startIcon={<FilterListIcon sx={{ fontSize: 16 }} />} onClick={() => setFilterOpen(!filterOpen)} sx={{ borderRadius: 2, px: 2, py: 0.75, color: '#475569', borderColor: '#D1D5DB', textTransform: 'none', fontSize: '0.875rem' }}>Filter</Button>
            <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={() => { setEditingTask(null); setFormData({ title: '', description: '', dueDate: '', priority: 'high', status: 'pending' }); setCreateOpen(true); }} sx={{ borderRadius: 2, px: 3, py: 1, bgcolor: '#2563EB', fontWeight: 600, textTransform: 'none', fontSize: '0.875rem' }}>New Task</Button>
          </Stack>

          <Collapse in={filterOpen}>
            <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
               <Stack spacing={2}>
                 <Box>
                    <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</Typography>
                    <Stack direction="row" spacing={1}>
                      {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
                        <Chip key={p} label={p} onClick={() => setPriorityFilter(prev => ({...prev, [p]: !prev[p]}))} variant={priorityFilter[p] ? 'filled' : 'outlined'} color={priorityFilter[p] ? 'primary' : 'default'} sx={{ borderRadius: 1.5, fontWeight: 600 }} />
                      ))}
                    </Stack>
                 </Box>
                 <Box>
                    <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</Typography>
                    <Stack direction="row" spacing={1}>
                      {(['pending', 'in_progress', 'completed'] as TaskStatus[]).map(s => (
                        <Chip key={s} label={s.replace('_', ' ')} onClick={() => setStatusFilter(prev => ({...prev, [s]: !prev[s]}))} variant={statusFilter[s] ? 'filled' : 'outlined'} color={statusFilter[s] ? 'primary' : 'default'} sx={{ borderRadius: 1.5, fontWeight: 600 }} />
                      ))}
                    </Stack>
                 </Box>
               </Stack>
            </Box>
          </Collapse>

          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ borderBottom: '1px solid #F1F5F9' }}>
                <TableCell padding="checkbox" sx={{ pl: 3 }}>
                  <Checkbox
                    size="small"
                    checked={filteredSortedTasks?.length ? selectedIds.size === filteredSortedTasks.length : false}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < (filteredSortedTasks?.length ?? 0)}
                    onChange={() => filteredSortedTasks && handleToggleSelectAll(filteredSortedTasks.map(t => t.id))}
                    sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#2563EB' } }}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sort.field === 'title'} direction={sort.direction} onClick={() => handleSort('title')} sx={{ fontWeight: 600, color: '#475569' }}>Title</TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sort.field === 'due'} direction={sort.direction} onClick={() => handleSort('due')} sx={{ fontWeight: 600, color: '#475569' }}>Due Date</TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sort.field === 'priority'} direction={sort.direction} onClick={() => handleSort('priority')} sx={{ fontWeight: 600, color: '#475569' }}>Priority</TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sort.field === 'status'} direction={sort.direction} onClick={() => handleSort('status')} sx={{ fontWeight: 600, color: '#475569' }}>Status</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ pr: 3 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSortedTasks ? filteredSortedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTaskComplete(task)}
                  onEdit={() => handleOpenEdit(task)}
                  onDelete={() => deleteTask(task.id)}
                  expanded={expanded[task.id]}
                  onExpand={() => setExpanded(prev => ({...prev, [task.id]: !prev[task.id]}))}
                  selected={selectedIds.has(task.id)}
                  onSelect={() => handleToggleSelect(task.id)}
                />
              )) : Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton height={48} /></TableCell></TableRow>
              ))}
              {filteredSortedTasks?.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8, color: '#94A3B8' }}>No tasks found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedIds.size > 0 && (
          <Paper elevation={4} sx={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', px: 3, py: 1.5, borderRadius: 3, bgcolor: '#1E293B', color: 'white', display: 'flex', alignItems: 'center', gap: 3, zIndex: 1000 }}>
            <Typography variant="body2" fontWeight={600}>{selectedIds.size} tasks selected</Typography>
            <Stack direction="row" spacing={1}>
               <Button size="small" variant="contained" onClick={() => handleBulkUpdate({ status: 'completed' })} sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600 }}>Mark Complete</Button>
               <Button size="small" variant="outlined" onClick={handleBulkDelete} sx={{ color: '#F8FAFC', borderColor: '#475569', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#94A3B8' } }}>Delete</Button>
            </Stack>
            <IconButton size="small" onClick={() => setSelectedIds(new Set())} sx={{ color: '#94A3B8' }}><ChevronRightIcon sx={{ transform: 'rotate(90deg)' }} /></IconButton>
          </Paper>
        )}
      </Box>

      {/* Task Detail Drawer */}
      <Drawer
        anchor="right"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400, md: 500 }, p: 0, border: 'none' } }}
      >
        {selectedTask && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0', color: '#0F172A' }}>
              <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight={700}>Task Details</Typography>
                <IconButton onClick={() => setDetailOpen(false)} size="small"><ChevronRightIcon /></IconButton>
              </Toolbar>
            </AppBar>
            
            <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
              <Stack spacing={4}>
                {/* Title */}
                <Box>
                  <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>Title</Typography>
                  <TextField
                    fullWidth
                    multiline
                    variant="standard"
                    value={detailData.title}
                    onChange={e => setDetailData({ ...detailData, title: e.target.value })}
                    onBlur={handleUpdateTask}
                    InputProps={{ disableUnderline: true, sx: { fontSize: '1.5rem', fontWeight: 700, p: 0 } }}
                  />
                </Box>

                {/* Status & Priority */}
                <Stack direction="row" spacing={3}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>Status</Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={detailData.status}
                      onChange={e => {
                        const nextData = { ...detailData, status: e.target.value as TaskStatus };
                        setDetailData(nextData);
                        // Trigger update immediately for selects
                        void (async () => {
                           try {
                             const res = await apiFetch<Task>(`/tasks/${selectedTask.id}`, {
                               method: 'PATCH',
                               body: JSON.stringify({ ...nextData, title: nextData.title.trim() }),
                             });
                             setTasks(prev => prev ? prev.map(t => t.id === selectedTask.id ? res : t) : prev);
                             setSelectedTask(res);
                           } catch { setToast('Failed to update status'); }
                        })();
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="pending">Not Started</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="completed">Complete</MenuItem>
                    </Select>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>Priority</Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={detailData.priority}
                      onChange={e => {
                        const nextData = { ...detailData, priority: e.target.value as TaskPriority };
                        setDetailData(nextData);
                         void (async () => {
                           try {
                             const res = await apiFetch<Task>(`/tasks/${selectedTask.id}`, {
                               method: 'PATCH',
                               body: JSON.stringify({ ...nextData, title: nextData.title.trim() }),
                             });
                             setTasks(prev => prev ? prev.map(t => t.id === selectedTask.id ? res : t) : prev);
                             setSelectedTask(res);
                           } catch { setToast('Failed to update priority'); }
                        })();
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </Box>
                </Stack>

                {/* Due Date */}
                <Box>
                  <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>Due Date</Typography>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    value={detailData.dueDate}
                    onChange={e => {
                        const nextData = { ...detailData, dueDate: e.target.value };
                        setDetailData(nextData);
                         void (async () => {
                           try {
                             const res = await apiFetch<Task>(`/tasks/${selectedTask.id}`, {
                               method: 'PATCH',
                               body: JSON.stringify({ ...nextData, title: nextData.title.trim(), dueDate: nextData.dueDate || null }),
                             });
                             setTasks(prev => prev ? prev.map(t => t.id === selectedTask.id ? res : t) : prev);
                             setSelectedTask(res);
                           } catch { setToast('Failed to update due date'); }
                        })();
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>

                {/* Description */}
                <Box>
                  <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>Description</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Add a detailed description..."
                    value={detailData.description}
                    onChange={e => setDetailData({ ...detailData, description: e.target.value })}
                    onBlur={handleUpdateTask}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>

                {/* Subtasks */}
                <Box>
                  <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 2, textTransform: 'uppercase' }}>Subtasks</Typography>
                  <List disablePadding>
                    {(selectedTask.subtasks ?? []).map(sub => (
                      <Stack key={sub.id} direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Checkbox size="small" checked={sub.isCompleted} onChange={() => toggleSubtask(sub.id, sub.isCompleted)} />
                        <Typography variant="body2" sx={{ flex: 1, textDecoration: sub.isCompleted ? 'line-through' : 'none', color: sub.isCompleted ? '#94A3B8' : '#334155' }}>{sub.title}</Typography>
                        <IconButton size="small" onClick={() => deleteSubtask(sub.id)}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></IconButton>
                      </Stack>
                    ))}
                  </List>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add a subtask..."
                      value={newSubtaskTitle}
                      onChange={e => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Button variant="contained" onClick={handleAddSubtask} sx={{ minWidth: 40, p: 0, borderRadius: 2, bgcolor: '#2563EB' }}><AddIcon fontSize="small" /></Button>
                  </Stack>
                </Box>

                {/* Attachments */}
                <Box>
                  <Typography variant="caption" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 2, textTransform: 'uppercase' }}>Attachments</Typography>
                  <List disablePadding>
                    {(selectedTask.attachments ?? []).map(att => (
                      <Paper key={att.id} variant="outlined" sx={{ mb: 1.5, p: 1.5, display: 'flex', alignItems: 'center', borderRadius: 2.5, borderColor: '#F1F5F9', '&:hover': { bgcolor: '#F8FAFC' } }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>{getFileIcon(att.mimetype)}</ListItemIcon>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#334155' }}>{att.filename}</Typography>
                          <Typography variant="caption" color="#94A3B8">{(att.size / 1024).toFixed(1)} KB</Typography>
                        </Box>
                        <Stack direction="row">
                          <IconButton size="small" onClick={() => handleFileDownload(att.url, att.filename)} sx={{ color: '#2563EB' }}><DownloadIcon fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={() => handleFileDelete(att.id)} sx={{ color: '#EF4444' }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                        </Stack>
                      </Paper>
                    ))}
                  </List>
                  <Button
                    fullWidth
                    component="label"
                    variant="outlined"
                    disabled={uploading}
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 2, borderRadius: 2.5, textTransform: 'none', borderStyle: 'dashed', py: 1.5, color: '#475569', borderColor: '#CBD5E1' }}
                  >
                    {uploading ? 'Uploading...' : 'Upload Attachment'}
                    <input type="file" hidden onChange={handleFileUpload} />
                  </Button>
                </Box>

                {/* Metadata */}
                <Box sx={{ pt: 4, borderTop: '1px solid #F1F5F9' }}>
                   <Typography variant="caption" color="#94A3B8" sx={{ display: 'block' }}>Created: {new Date(selectedTask.createdAt).toLocaleString()}</Typography>
                   <Typography variant="caption" color="#94A3B8" sx={{ display: 'block' }}>Updated: {new Date(selectedTask.updatedAt).toLocaleString()}</Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Task Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField fullWidth label="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Enter task title..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField fullWidth label="Due Date" type="date" InputLabelProps={{ shrink: true }} value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <FormControl fullWidth>
              <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ mb: 0.5 }}>Priority</Typography>
              <Select size="small" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})} sx={{ borderRadius: 2 }}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ mb: 0.5 }}>Status</Typography>
              <Select size="small" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as TaskStatus})} sx={{ borderRadius: 2 }}>
                <MenuItem value="pending">Not Started</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Complete</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button fullWidth variant="outlined" onClick={() => setCreateOpen(false)} sx={{ borderRadius: 2, color: '#475569', borderColor: '#D1D5DB', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button fullWidth variant="contained" onClick={() => void handleSaveTask()} sx={{ borderRadius: 2, bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600 }}>{editingTask ? 'Save Changes' : 'Add Task'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  )
}

function TaskRow({ task, onToggle, onEdit, onDelete, expanded, onExpand, selected, onSelect }: { task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void; expanded?: boolean; onExpand: () => void; selected: boolean; onSelect: () => void }) {
  const isCompleted = task.status === 'completed'
  const priorityColors: Record<TaskPriority, string> = {
    low: 'border-[#22C55E] text-[#166534] bg-[#F0FDF4]',
    medium: 'border-[#64748B] text-[#334155] bg-[#F8FAFC]',
    high: 'border-[#FACC15] text-[#854D0E] bg-[#FEFCE8]',
    urgent: 'border-[#EF4444] text-[#991B1B] bg-[#FEF2F2]',
  }

  return (
    <>
      <TableRow hover selected={selected} sx={{ borderBottom: '1px solid #F1F5F9', '&:last-child': { borderBottom: 'none' }, '&.Mui-selected': { bgcolor: '#F1F5F9 !important' } }}>
        <TableCell padding="checkbox" sx={{ pl: 3 }}>
          <Checkbox checked={selected} onClick={onSelect} size="small" sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#2563EB' } }} />
        </TableCell>
        <TableCell sx={{ py: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Checkbox checked={isCompleted} onClick={onToggle} size="small" sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#2563EB' } }} />
            <IconButton size="small" onClick={onExpand} sx={{ p: 0.5 }}>
              {expanded ? <KeyboardArrowDownIcon sx={{ fontSize: 18 }} /> : <ChevronRightIcon sx={{ fontSize: 18 }} />}
            </IconButton>
            <Typography variant="body2" fontWeight={600} sx={{ color: isCompleted ? '#94A3B8' : '#334155', textDecoration: isCompleted ? 'line-through' : 'none', cursor: 'pointer' }} onClick={onEdit}>
              {task.title}
            </Typography>
            {task.description && <AttachFileIcon sx={{ fontSize: 14, color: '#94A3B8' }} />}
          </Stack>
        </TableCell>
        <TableCell sx={{ py: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748B' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</Typography>
        </TableCell>
        <TableCell sx={{ py: 2 }}>
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${priorityColors[task.priority]}`}>{task.priority}</span>
        </TableCell>
        <TableCell sx={{ py: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid', borderColor: isCompleted ? '#2563EB' : '#CBD5E1', bgcolor: isCompleted ? '#2563EB' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isCompleted && <Box sx={{ width: 6, height: 6, bgcolor: 'white', borderRadius: '50%' }} />}
            </Box>
            <Typography variant="body2" fontWeight={500} sx={{ color: '#475569' }}>{task.status.replace('_', ' ')}</Typography>
          </Stack>
        </TableCell>
        <TableCell align="right" sx={{ pr: 3, py: 2 }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton size="small" onClick={onEdit} sx={{ color: '#94A3B8' }}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
            <IconButton size="small" onClick={onDelete} sx={{ color: '#94A3B8' }}><DeleteOutlineIcon sx={{ fontSize: 18 }} /></IconButton>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0, px: 0, border: 'none' }}>
           <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ py: 2, pl: 10, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                 {(task.subtasks ?? []).map(s => (
                   <Stack key={s.id} direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                     <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.isCompleted ? '#2563EB' : '#CBD5E1' }} />
                     <Typography variant="body2" sx={{ color: s.isCompleted ? '#94A3B8' : '#475569', textDecoration: s.isCompleted ? 'line-through' : 'none' }}>{s.title}</Typography>
                   </Stack>
                 ))}
                 <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }} onClick={onEdit}>+ Add or Manage Subtasks</Typography>
              </Box>
           </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

