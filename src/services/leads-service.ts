import { apiRequest } from "./api.js";
import type {
  CreatePublicLeadInput,
  PublicLead,
  PublicLeadStatus
} from "../types/app.js";

interface LeadResponse {
  lead: PublicLead;
}

interface LeadsResponse {
  leads: PublicLead[];
}

export interface LeadsFilter {
  status?: PublicLeadStatus;
}

function queryFromFilter(filter: LeadsFilter): string {
  const params = new URLSearchParams();
  if (filter.status) {
    params.set("status", filter.status);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const leadsService = {
  async submit(input: CreatePublicLeadInput): Promise<PublicLead> {
    const response = await apiRequest<LeadResponse>("/api/public/leads", {
      method: "POST",
      body: input as unknown as Record<string, unknown>
    });
    return response.lead;
  },

  async list(filter: LeadsFilter = {}): Promise<PublicLead[]> {
    const response = await apiRequest<LeadsResponse>(
      `/api/admin/public-leads${queryFromFilter(filter)}`
    );
    return response.leads;
  }
};
