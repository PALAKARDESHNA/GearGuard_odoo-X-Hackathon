import { useAuth } from '../context/AuthContext';

export const useRole = () => {
  const { user } = useAuth();

  const isManager = user?.role === 'manager';
  const isTechnician = user?.role === 'technician' || isManager;
  const isEmployee = user?.role === 'employee' || isTechnician;

  const canCreateEquipment = isManager;
  const canEditEquipment = isManager;
  const canDeleteEquipment = isManager;
  const canViewEquipment = isEmployee;

  const canCreateTeam = isManager;
  const canEditTeam = isManager;
  const canDeleteTeam = isManager;
  const canViewTeams = isEmployee;

  const canCreateRequest = isEmployee;
  const canUpdateRequest = isTechnician;
  const canAssignRequest = isTechnician;
  const canDeleteRequest = isManager;
  const canViewRequests = isEmployee;

  const canViewReports = isManager;
  const canManageUsers = isManager;
  const canManageDepartments = isManager;

  return {
    isManager,
    isTechnician,
    isEmployee,
    canCreateEquipment,
    canEditEquipment,
    canDeleteEquipment,
    canViewEquipment,
    canCreateTeam,
    canEditTeam,
    canDeleteTeam,
    canViewTeams,
    canCreateRequest,
    canUpdateRequest,
    canAssignRequest,
    canDeleteRequest,
    canViewRequests,
    canViewReports,
    canManageUsers,
    canManageDepartments,
  };
};

