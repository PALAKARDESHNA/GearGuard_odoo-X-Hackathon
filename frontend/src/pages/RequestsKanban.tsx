import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { requestsAPI, equipmentAPI } from '../services/api';
import { MaintenanceRequest, Equipment } from '../types';
import RequestForm from '../components/RequestForm';
import { useRole } from '../hooks/useRole';

const STAGES: Array<'New' | 'In Progress' | 'Repaired' | 'Scrap'> = [
  'New',
  'In Progress',
  'Repaired',
  'Scrap',
];

const STAGE_COLORS = {
  New: '#1976d2',
  'In Progress': '#ed6c02',
  Repaired: '#2e7d32',
  Scrap: '#d32f2f',
};

const RequestsKanban: React.FC = () => {
  const { canCreateRequest, canUpdateRequest, canAssignRequest } = useRole();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await requestsAPI.getAll();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll();
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchEquipment();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const requestId = parseInt(draggableId);
    const newStage = destination.droppableId as MaintenanceRequest['stage'];

    const request = requests.find((r) => r.id === requestId);
    if (!request || request.stage === newStage) return;

    try {
      await requestsAPI.update(requestId, { stage: newStage });
      
      // If moving to Repaired, update duration if needed
      if (newStage === 'Repaired' && !request.duration_hours) {
        // Could open a dialog to enter duration here
      }

      // Update local state
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, stage: newStage } : r))
      );
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request');
    }
  };

  const handleRequestClick = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setOpenDetail(true);
  };

  const handleAssign = async (requestId: number, technicianId: number) => {
    try {
      await requestsAPI.assign(requestId, technicianId, 'In Progress');
      fetchData();
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('Failed to assign technician');
    }
  };

  const getRequestsByStage = (stage: string) => {
    return requests.filter((r) => r.stage === stage);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Maintenance Kanban Board
        </Typography>
        {canCreateRequest && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            New Request
          </Button>
        )}
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box display="flex" gap={2} sx={{ overflowX: 'auto', pb: 2 }}>
          {STAGES.map((stage) => (
            <Droppable key={stage} droppableId={stage}>
              {(provided, snapshot) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minWidth: 300,
                    p: 2,
                    bgcolor: snapshot.isDraggingOver ? '#f5f5f5' : 'white',
                    border: `2px solid ${STAGE_COLORS[stage]}`,
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {stage}
                    </Typography>
                    <Chip
                      label={getRequestsByStage(stage).length}
                      size="small"
                      sx={{ bgcolor: STAGE_COLORS[stage], color: 'white' }}
                    />
                  </Box>

                  {getRequestsByStage(stage).map((request, index) => (
                    <Draggable
                      key={request.id}
                      draggableId={request.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            mb: 2,
                            cursor: 'pointer',
                            opacity: snapshot.isDragging ? 0.8 : 1,
                            borderLeft: request.is_overdue ? '4px solid red' : 'none',
                            '&:hover': {
                              boxShadow: 4,
                            },
                          }}
                          onClick={() => handleRequestClick(request)}
                        >
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              {request.subject}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {request.equipment_name}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={1} mb={1}>
                              <Chip
                                label={request.request_type}
                                size="small"
                                color={request.request_type === 'Preventive' ? 'primary' : 'warning'}
                              />
                              <Chip
                                label={request.priority}
                                size="small"
                                color={
                                  request.priority === 'Urgent'
                                    ? 'error'
                                    : request.priority === 'High'
                                    ? 'warning'
                                    : 'default'
                                }
                              />
                            </Box>
                            {request.is_overdue && (
                              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                                <WarningIcon color="error" fontSize="small" />
                                <Typography variant="caption" color="error">
                                  Overdue
                                </Typography>
                              </Box>
                            )}
                            {request.technician_name ? (
                              <Box display="flex" alignItems="center" gap={1} mt={1}>
                                <Avatar sx={{ width: 24, height: 24 }}>
                                  {request.technician_name.charAt(0)}
                                </Avatar>
                                <Typography variant="caption">
                                  {request.technician_name}
                                </Typography>
                              </Box>
                            ) : (
                              <Box mt={1}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const techId = window.prompt('Enter technician ID:');
                                    if (techId) {
                                      handleAssign(request.id, parseInt(techId));
                                    }
                                  }}
                                >
                                  Assign
                                </Button>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Paper>
              )}
            </Droppable>
          ))}
        </Box>
      </DragDropContext>

      <RequestForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          fetchData();
        }}
        equipment={equipment}
      />

      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        {selectedRequest && (
          <>
            <DialogTitle>{selectedRequest.subject}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Equipment
                  </Typography>
                  <Typography variant="body1">{selectedRequest.equipment_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Chip
                    label={selectedRequest.request_type}
                    size="small"
                    color={selectedRequest.request_type === 'Preventive' ? 'primary' : 'warning'}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Stage
                  </Typography>
                  <Chip label={selectedRequest.stage} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip label={selectedRequest.priority} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Team
                  </Typography>
                  <Typography variant="body1">{selectedRequest.team_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Technician
                  </Typography>
                  <Typography variant="body1">
                    {selectedRequest.technician_name || 'Unassigned'}
                  </Typography>
                </Grid>
                {selectedRequest.scheduled_date && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedRequest.scheduled_date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
                {selectedRequest.duration_hours && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Duration (hours)
                    </Typography>
                    <Typography variant="body1">{selectedRequest.duration_hours}</Typography>
                  </Grid>
                )}
                {selectedRequest.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{selectedRequest.description}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetail(false)}>Close</Button>
              <Button
                variant="contained"
                onClick={async () => {
                  if (selectedRequest.assigned_technician_id) {
                    await handleAssign(selectedRequest.id, selectedRequest.assigned_technician_id);
                  }
                  setOpenDetail(false);
                }}
              >
                Update
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default RequestsKanban;

