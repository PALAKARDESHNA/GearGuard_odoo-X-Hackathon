export interface Department {
  id: number;
  name: string;
  created_at?: string;
}

export interface User {
  id: number;
  name: string;
  email?: string;
  role: 'employee' | 'technician' | 'manager';
  department_id?: number;
  department_name?: string;
  created_at?: string;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  members?: Array<{ id: number; name: string }>;
  created_at?: string;
}

export interface Equipment {
  id: number;
  name: string;
  serial_number?: string;
  category?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  location?: string;
  department_id?: number;
  department_name?: string;
  assigned_to_user_id?: number;
  assigned_user_name?: string;
  maintenance_team_id: number;
  maintenance_team_name?: string;
  default_technician_id?: number;
  default_technician_name?: string;
  status?: string;
  notes?: string;
  open_requests_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MaintenanceRequest {
  id: number;
  subject: string;
  description?: string;
  request_type: 'Corrective' | 'Preventive';
  equipment_id: number;
  equipment_name?: string;
  equipment_serial?: string;
  equipment_category?: string;
  maintenance_team_id: number;
  team_name?: string;
  assigned_technician_id?: number;
  technician_name?: string;
  technician_email?: string;
  scheduled_date?: string;
  duration_hours?: number;
  stage: 'New' | 'In Progress' | 'Repaired' | 'Scrap';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  is_overdue?: boolean;
  created_by_user_id?: number;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface PivotReport {
  group_name: string;
  total_requests: number;
  new_count: number;
  in_progress_count: number;
  repaired_count: number;
  scrap_count: number;
}

