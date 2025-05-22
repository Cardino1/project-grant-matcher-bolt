export interface User {
  id: string;
  email: string;
  is_admin: boolean;
  subscription_status: string;
  created_at: string;
}

export interface Grant {
  id: string;
  title: string;
  organization: string;
  description: string;
  funding_amount?: string;
  application_deadline?: string;
  art_forms: string[];
  location?: string;
  experience_level?: string;
  grant_link?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedGrant {
  id: string;
  user_id: string;
  grant_id: string;
  created_at: string;
  grant: Grant;
}

export type ArtForm = 
  | 'Visual Arts'
  | 'Performing Arts'
  | 'Music'
  | 'Literature'
  | 'Film & Media'
  | 'Digital Arts'
  | 'Multidisciplinary'
  | 'Sculpture'
  | 'Photography'
  | 'Design'
  | 'Crafts';

export type ExperienceLevel = 
  | 'Emerging'
  | 'Mid-Career'
  | 'Established'
  | 'Student'
  | 'All Levels';

export interface GrantFilters {
  search?: string;
  artForms?: string[];
  fundingAmount?: string;
  deadline?: string;
  experienceLevel?: string;
  location?: string;
}