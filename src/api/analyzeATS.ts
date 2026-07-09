import { z } from 'zod';
import { createEndpoint, AtsAnalyses } from 'zite-integrations-backend-sdk';
import { callGeminiJSON, callGeminiWithFile } from '../lib/gemini';

// Safe base64 encoder — no spread, no recursion, array-based for large files
function uint8ToBase64(bytes: Uint8Array): string {
  const lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const len = bytes.length;
  const parts: string[] = [];
  for (let i = 0; i < len; i += 3) {
    const a = bytes[i];
    const b = i + 1 < len ? bytes[i + 1] : 0;
    const c = i + 2 < len ? bytes[i + 2] : 0;
    parts.push(
      lookup[a >> 2] +
      lookup[((a & 3) << 4) | (b >> 4)] +
      (i + 1 < len ? lookup[((b & 15) << 2) | (c >> 6)] : '=') +
      (i + 2 < len ? lookup[c & 63] : '=')
    );
  }
  return parts.join('');
}

// Extract text from a .docx zip by pulling <w:t> tags from the raw bytes
function extractTextFromDocx(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const rawStr = new TextDecoder().decode(bytes);

  // docx is a zip containing XML — pull text from <w:t> tags
  const parts: string[] = [];
  const tagRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let match;
  while ((match = tagRegex.exec(rawStr)) !== null) {
    parts.push(match[1]);
  }

  if (parts.length > 0) {
    return parts.join(' ');
  }

  // Fallback: strip XML tags
  return rawStr.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    resumeText: z.string().optional(),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    jobDescription: z.string().optional(),
  }),
  outputSchema: z.object({
    id: z.string(),
    overallScore: z.number(),
    parsedResumeText: z.string(),
    categories: z.array(z.object({
      name: z.string(),
      score: z.number(),
      feedback: z.string(),
    })),
    keywords: z.object({
      found: z.array(z.string()),
      missing: z.array(z.string()),
    }),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ input, context }) => {
    let resumeText = input.resumeText || '';

    // If a file URL is provided, fetch and parse it
    if (input.fileUrl) {
      const fileRes = await fetch(input.fileUrl);
      if (!fileRes.ok) throw new Error('Failed to fetch uploaded file');
      const buffer = await fileRes.arrayBuffer();
      const ext = (input.fileName || '').toLowerCase();

      if (ext.endsWith('.docx') || ext.endsWith('.doc')) {
        // Extract text directly — Gemini doesn't support Word MIME types
        resumeText = extractTextFromDocx(buffer);
        if (!resumeText || resumeText.length < 20) {
          throw new Error('Could not extract text from the Word document. Please paste your resume text directly instead.');
        }
      } else {
        // PDF — send to Gemini multimodal
        const base64 = uint8ToBase64(new Uint8Array(buffer));
        const parsePrompt = `Extract ALL text content from this resume document. Include everything: name, contact info, summary, experience with all bullet points, education, skills, certifications, projects, achievements, languages, interests, references — everything visible in the document.

Preserve the structure and sections. Return the complete text content exactly as it appears, maintaining section headers and bullet points. Do not summarize or shorten anything.`;

        resumeText = await callGeminiWithFile(
          base64,
          'application/pdf',
          parsePrompt,
          'You are a document parser. Extract complete text content from resumes accurately, preserving all details and structure.'
        );
      }
    }

    if (!resumeText.trim()) {
      throw new Error('No resume text provided. Please upload a file or paste resume text.');
    }

    const jdPart = input.jobDescription ? `\n\nJob Description:\n${input.jobDescription}` : '';
    const prompt = `Analyze this resume for ATS (Applicant Tracking System) compatibility.${jdPart}

Resume:
${resumeText}

Return JSON with this exact structure:
{
  "overallScore": <number 0-100>,
  "categories": [
    {"name": "Formatting", "score": <0-100>, "feedback": "2-3 short bullet points separated by newlines"},
    {"name": "Keywords", "score": <0-100>, "feedback": "2-3 short bullet points separated by newlines"},
    {"name": "Sections", "score": <0-100>, "feedback": "2-3 short bullet points separated by newlines"},
    {"name": "Readability", "score": <0-100>, "feedback": "2-3 short bullet points separated by newlines"},
    {"name": "Impact", "score": <0-100>, "feedback": "2-3 short bullet points separated by newlines"},
    {"name": "Grammar", "score": <0-100>, "feedback": "2-3 short bullet points separated by newlines"}
  ],
  "keywords": {
    "found": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"]
  },
  "recommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"]
}`;

    const result = await callGeminiJSON(prompt, 'You are an expert ATS resume analyst. Analyze resumes for ATS compatibility and provide actionable, specific feedback.');

    const analysis = await AtsAnalyses.create({
      record: {
        title: `ATS Analysis - ${new Date().toLocaleDateString()}`,
        user: context.user.id,
        matchScore: result.overallScore,
        resumeText: resumeText,
        jobDescription: input.jobDescription,
        analysisData: JSON.stringify(result),
        recommendations: result.recommendations.join('\n'),
      },
    });

    return { id: analysis.id, parsedResumeText: resumeText, ...result };
  },
});
