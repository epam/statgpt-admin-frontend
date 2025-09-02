import { BaseEntityWithDetails } from './base-entity';

export interface Channel extends BaseEntityWithDetails {
  /** Deployment Id */
  deployment_id?: string;

  /** Llm Model */
  llm_model?: string;
}

export interface ChannelTerm {
  createdAt?: string;
  definition?: string;
  domain?: string;
  id?: number;
  source?: string;
  term?: string;
  updatedAt?: string;
}
export interface ChannelUpdate {
  /** Title */
  title?: string;
  /** Description */
  description?: string;
  /** Deployment Id */
  deployment_id?: string;
}
