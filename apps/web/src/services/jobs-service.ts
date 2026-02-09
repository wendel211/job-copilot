// 🔴 Mude disto:
// import api from '@/lib/api'; 

// 🟢 Para isto (note o arquivo 'axios'):
import api from '@/lib/axios';

export interface JobDetails {
  id: string;
  title: string;
  description: string;
  applyUrl: string;
  remote: boolean;
  location: string | null;
  postedAt: string;
  descriptionEditedAt?: string | null;
  company: {
    name: string;
    website: string | null;
    careerPageUrl?: string;
  };
}

export const jobsService = {


  getById: async (id: string): Promise<JobDetails> => {

    const { data } = await api.get(`/jobs/${id}`);
    return data;
  },
};