import JobsRepository from '../repositories/JobsRepository';
import JobApplicationDTO from '../dtos/JobApplicationDTO';
import ApiError from '../utils/ApiError';

const jobsRepo = new JobsRepository();

/**
 * Service managing job tracker pipeline records.
 */
export class JobsService {
  async getJobs(userId: string) {
    const list = await jobsRepo.findByUserId(userId);
    return list.map(a => new JobApplicationDTO(a));
  }

  async saveJob(userId: string, data: any) {
    let app;
    if (data.id) {
      app = await jobsRepo.update(data.id, userId, data);
      if (!app) throw new ApiError(404, 'Job application not found.');
    } else {
      app = await jobsRepo.create({ ...data, userId });
    }
    return new JobApplicationDTO(app);
  }

  async deleteJob(id: string, userId: string) {
    const app = await jobsRepo.softDelete(id, userId);
    if (!app) throw new ApiError(404, 'Job application not found.');
    return { success: true };
  }
}
export default JobsService;
