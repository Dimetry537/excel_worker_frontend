export interface Personal {
  id: number;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PersonalCreateData = {
  full_name: string;
};
