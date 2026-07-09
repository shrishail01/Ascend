import { z } from 'zod';
import { createEndpoint, ZitePdf } from 'zite-integrations-backend-sdk';
import { callGeminiJSON } from '../lib/gemini';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    resumeText: z.string(),
    jobDescription: z.string().optional(),
  }),
  outputSchema: z.object({
    optimizedText: z.string(),
    pdfUrl: z.string(),
    sections: z.object({
      fullName: z.string(),
      title: z.string(),
      email: z.string(),
      phone: z.string(),
      location: z.string(),
      linkedIn: z.string(),
      summary: z.string(),
      experience: z.array(z.object({
        jobTitle: z.string(),
        company: z.string(),
        duration: z.string(),
        bullets: z.array(z.string()),
      })),
      education: z.array(z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.string(),
      })),
      skills: z.array(z.string()),
      certifications: z.array(z.string()),
      projects: z.array(z.object({
        name: z.string(),
        description: z.string(),
      })),
    }),
  }),
  execute: async ({ input }) => {
    const jdCtx = input.jobDescription ? `\nTarget Job Description:\n${input.jobDescription}\n` : '';

    const prompt = `You are a professional resume writer. Take this resume and rewrite it into a HIGHLY PROFESSIONAL, ATS-OPTIMIZED resume.
${jdCtx}
Original Resume:
${input.resumeText}

Rules:
- Use strong action verbs (Led, Engineered, Optimized, Spearheaded, Architected, Delivered)
- Add quantifiable metrics and numbers wherever possible
- Remove personal pronouns
- Use industry-standard section names
- Optimize keywords for ATS
- Keep bullet points concise (1-2 lines each)
- Ensure proper formatting for ATS parsing
- If job description provided, tailor keywords and skills to match
- Extract or infer contact details from the original resume. If not found, use empty strings.

Return JSON:
{
  "fullName": "Full Name",
  "title": "Professional Title",
  "email": "email@example.com",
  "phone": "+1-234-567-8900",
  "location": "City, State",
  "linkedIn": "linkedin.com/in/profile",
  "summary": "3-4 sentence professional summary with keywords",
  "experience": [
    {
      "jobTitle": "Title",
      "company": "Company Name",
      "duration": "Jan 2022 - Present",
      "bullets": ["Achievement-focused bullet with metrics", "Another bullet"]
    }
  ],
  "education": [
    {"degree": "Degree Name", "institution": "University", "year": "2020"}
  ],
  "skills": ["Skill 1", "Skill 2"],
  "certifications": ["Cert 1"],
  "projects": [
    {"name": "Project Name", "description": "Brief description with impact"}
  ]
}`;

    const sections = await callGeminiJSON(prompt, 'You are an elite resume writer who creates ATS-optimized, professional resumes that pass automated screening systems.');

    // Build formatted text version
    const lines: string[] = [];
    lines.push(sections.fullName.toUpperCase());
    lines.push(sections.title);
    lines.push([sections.email, sections.phone, sections.location, sections.linkedIn].filter(Boolean).join(' | '));
    lines.push('');
    if (sections.summary) { lines.push('PROFESSIONAL SUMMARY', sections.summary, ''); }
    if (sections.experience?.length) {
      lines.push('EXPERIENCE');
      sections.experience.forEach((e: any) => {
        lines.push(`${e.jobTitle} — ${e.company}`);
        lines.push(e.duration);
        e.bullets.forEach((b: string) => lines.push(`• ${b}`));
        lines.push('');
      });
    }
    if (sections.education?.length) {
      lines.push('EDUCATION');
      sections.education.forEach((e: any) => lines.push(`${e.degree} — ${e.institution} (${e.year})`));
      lines.push('');
    }
    if (sections.skills?.length) { lines.push('SKILLS', sections.skills.join(' • '), ''); }
    if (sections.certifications?.length) { lines.push('CERTIFICATIONS', ...sections.certifications, ''); }
    if (sections.projects?.length) {
      lines.push('PROJECTS');
      sections.projects.forEach((p: any) => lines.push(`${p.name}: ${p.description}`));
    }
    const optimizedText = lines.join('\n');

    // Generate professional PDF
    const esc = (s: unknown) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const expHtml = (sections.experience || []).map((e: any) => `
      <div class="exp">
        <div class="exp-header">
          <div><strong>${esc(e.jobTitle)}</strong> — ${esc(e.company)}</div>
          <div class="date">${esc(e.duration)}</div>
        </div>
        <ul>${(e.bullets || []).map((b: string) => `<li>${esc(b)}</li>`).join('')}</ul>
      </div>`).join('');

    const eduHtml = (sections.education || []).map((e: any) =>
      `<div class="edu-item"><strong>${esc(e.degree)}</strong> — ${esc(e.institution)} <span class="date">${esc(e.year)}</span></div>`
    ).join('');

    const skillsHtml = (sections.skills || []).map((s: string) => `<span class="skill">${esc(s)}</span>`).join('');
    const certHtml = (sections.certifications || []).map((c: string) => `<li>${esc(c)}</li>`).join('');
    const projHtml = (sections.projects || []).map((p: any) => `<div class="proj"><strong>${esc(p.name)}</strong> — ${esc(p.description)}</div>`).join('');

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@page { size: letter; margin: 0.55in 0.65in; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; font-size: 10pt; line-height: 1.55; margin: 0; }
h1 { font-size: 20pt; margin: 0 0 2px; letter-spacing: 1px; color: #111; text-transform: uppercase; }
.subtitle { font-size: 11pt; color: #333; margin-bottom: 4px; }
.contact { font-size: 8.5pt; color: #555; margin-bottom: 16px; }
h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a; border-bottom: 1.5px solid #333; padding-bottom: 3px; margin: 16px 0 8px; }
.exp { margin-bottom: 10px; }
.exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
.date { color: #555; font-size: 9pt; white-space: nowrap; }
ul { margin: 3px 0 0 0; padding-left: 18px; }
li { margin-bottom: 2px; font-size: 9.5pt; }
.edu-item { margin-bottom: 4px; }
.skills-wrap { display: flex; flex-wrap: wrap; gap: 5px; }
.skill { background: #f3f4f6; padding: 2px 8px; border-radius: 3px; font-size: 8.5pt; }
.proj { margin-bottom: 5px; font-size: 9.5pt; }
p { margin: 0 0 6px; }
</style></head><body>
<h1>${esc(sections.fullName)}</h1>
<div class="subtitle">${esc(sections.title)}</div>
<div class="contact">${[esc(sections.email), esc(sections.phone), esc(sections.location), esc(sections.linkedIn)].filter(Boolean).join(' &nbsp;|&nbsp; ')}</div>
${sections.summary ? `<h2>Professional Summary</h2><p>${esc(sections.summary)}</p>` : ''}
${expHtml ? `<h2>Experience</h2>${expHtml}` : ''}
${eduHtml ? `<h2>Education</h2>${eduHtml}` : ''}
${skillsHtml ? `<h2>Skills</h2><div class="skills-wrap">${skillsHtml}</div>` : ''}
${certHtml ? `<h2>Certifications</h2><ul>${certHtml}</ul>` : ''}
${projHtml ? `<h2>Projects</h2>${projHtml}` : ''}
</body></html>`;

    const { url: pdfUrl } = await ZitePdf.renderHtml({
      html,
      filename: `${sections.fullName.replace(/\s+/g, '_')}_ATS_Resume.pdf`,
    });

    return { optimizedText, pdfUrl, sections };
  },
});
