import ResumesRepository from '../repositories/ResumesRepository';
import ResumeDTO from '../dtos/ResumeDTO';
import ApiError from '../utils/ApiError';
import Resume from '../models/Resume';

const resumesRepo = new ResumesRepository();

/**
 * Service handling resume creation, fetching, and template storage.
 */
export class ResumeService {
  async getResumes(userId: string) {
    const list = await resumesRepo.findByUserId(userId);
    return list.map(r => new ResumeDTO(r));
  }

  async getResume(id: string, userId: string) {
    const resume = await resumesRepo.findById(id);
    if (!resume || resume.userId.toString() !== userId) {
      throw new ApiError(404, 'Resume not found.');
    }
    return new ResumeDTO(resume);
  }

  /**
   * Saves or updates a resume document, saving historic states to versions array.
   */
  async saveResume(userId: string, data: any) {
    let resume;
    const targetId = data.id || data._id; // Accept id or _id from frontend
    
    if (targetId) {
      const existing = await resumesRepo.findById(targetId);
      if (!existing || existing.userId.toString() !== userId) {
        throw new ApiError(404, 'Resume not found.');
      }

      // Add historical version checkpoint
      const oldVersion = {
        versionId: new Date().getTime().toString(),
        title: existing.title,
        content: existing.content,
        createdAt: new Date(),
      };

      await Resume.updateOne(
        { _id: targetId },
        { $push: { versions: oldVersion } }
      );

      resume = await resumesRepo.update(targetId, userId, {
        title: data.title,
        template: data.template,
        content: data.content,
      });
    } else {
      resume = await resumesRepo.create({
        title: data.title,
        template: data.template,
        content: data.content,
        userId,
      });
    }
    return new ResumeDTO(resume);
  }

  async deleteResume(id: string, userId: string) {
    const resume = await resumesRepo.softDelete(id, userId);
    if (!resume) throw new ApiError(404, 'Resume not found.');
    return { success: true };
  }

  /**
   * Clones an existing resume document.
   */
  async duplicateResume(id: string, userId: string) {
    const original = await resumesRepo.findById(id);
    if (!original || original.userId.toString() !== userId) {
      throw new ApiError(404, 'Original resume not found.');
    }

    const copy = await resumesRepo.create({
      userId,
      title: `Copy of ${original.title}`,
      template: original.template,
      content: original.content,
    });

    return new ResumeDTO(copy);
  }
}
export default ResumeService;
