import { z } from 'zod';
import { createEndpoint, ZitePdf, Resumes } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({ url: z.string() }),
  execute: async ({ input }) => {
    const resume = await Resumes.findOne({ id: input.id });
    if (!resume) throw new Error('Resume not found');

    const content = JSON.parse(resume.content || '{}');
    const esc = (s: unknown) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const experienceHtml = (content.experience || []).map((e: any) => `
      <div class="entry">
        <div class="entry-header">
          <strong>${esc(e.title)}</strong> at ${esc(e.company)}
          <span class="date">${esc(e.startDate)} - ${esc(e.endDate || 'Present')}</span>
        </div>
        <p>${esc(e.description)}</p>
      </div>
    `).join('');

    const educationHtml = (content.education || []).map((e: any) => `
      <div class="entry">
        <div class="entry-header">
          <strong>${esc(e.degree)}</strong> - ${esc(e.school)}
          <span class="date">${esc(e.year)}</span>
        </div>
      </div>
    `).join('');

    const skillsHtml = (content.skills || []).map((s: string) => `<span class="skill">${esc(s)}</span>`).join('');

    const projectsHtml = (content.projects || []).map((p: any) => `
      <div class="entry">
        <strong>${esc(p.name)}</strong>
        <p>${esc(p.description)}</p>
      </div>
    `).join('');

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@page { size: letter; margin: 0.6in 0.7in; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; font-size: 10pt; line-height: 1.5; }
h1 { font-size: 22pt; margin: 0 0 4px; color: #111; }
.subtitle { color: #555; font-size: 11pt; margin-bottom: 16px; }
h2 { font-size: 12pt; text-transform: uppercase; letter-spacing: 1px; color: #2563eb; border-bottom: 1.5px solid #2563eb; padding-bottom: 4px; margin: 18px 0 10px; }
.entry { margin-bottom: 12px; }
.entry-header { display: flex; justify-content: space-between; align-items: baseline; }
.date { color: #666; font-size: 9pt; }
p { margin: 4px 0; }
.skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
.skill { background: #eff6ff; color: #1e40af; padding: 3px 10px; border-radius: 4px; font-size: 9pt; }
.contact { color: #555; font-size: 9pt; }
</style></head><body>
<h1>${esc(content.fullName || resume.title)}</h1>
<div class="subtitle">${esc(content.title || '')}</div>
<div class="contact">${esc(content.email || '')} ${content.phone ? '• ' + esc(content.phone) : ''} ${content.location ? '• ' + esc(content.location) : ''}</div>
${content.summary ? `<h2>Summary</h2><p>${esc(content.summary)}</p>` : ''}
${experienceHtml ? `<h2>Experience</h2>${experienceHtml}` : ''}
${educationHtml ? `<h2>Education</h2>${educationHtml}` : ''}
${skillsHtml ? `<h2>Skills</h2><div class="skills-list">${skillsHtml}</div>` : ''}
${projectsHtml ? `<h2>Projects</h2>${projectsHtml}` : ''}
</body></html>`;

    const { url } = await ZitePdf.renderHtml({ html, filename: `${resume.title || 'resume'}.pdf` });
    return { url };
  },
});
