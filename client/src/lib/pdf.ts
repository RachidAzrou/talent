import { 
  CandidateData,
} from '@/components/pdf/CandidateTemplate';

export const generateCandidateData = (formData: any): CandidateData => {
  const candidateData: CandidateData = {
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    email: formData.email || '',
    phone: formData.phone || '',
    location: formData.location || '',
    currentPosition: formData.position || formData.currentPosition || '',
    linkedinUrl: formData.linkedinUrl || '',
    summary: formData.summary || formData.coverLetter || '',
    skills: Array.isArray(formData.skills) ? formData.skills : 
      (typeof formData.skills === 'string' ? formData.skills.split(',').map(s => s.trim()) : []),
  };
  
  // Parse education if available
  if (formData.education) {
    const educationText = formData.education;
    candidateData.education = [{
      degree: extractDegreeFromEducation(educationText),
      institution: extractInstitutionFromEducation(educationText),
      graduationDate: extractDateFromEducation(educationText) || 'N/A'
    }];
  }
  
  // Parse experience if available
  if (formData.experience) {
    const experienceText = formData.experience;
    candidateData.experience = [{
      title: formData.position || extractTitleFromExperience(experienceText) || 'Professional',
      company: extractCompanyFromExperience(experienceText) || 'N/A',
      startDate: extractStartDateFromExperience(experienceText) || 'N/A',
      endDate: extractEndDateFromExperience(experienceText) || 'Present',
      description: extractDescriptionFromExperience(experienceText)
    }];
  }
  
  return candidateData;
};

// Helper functions to extract data from unstructured text
function extractDegreeFromEducation(text: string): string {
  // Simple heuristic - try to find common degree patterns
  const degrees = ['Bachelor', 'Master', 'PhD', 'B.S.', 'M.S.', 'B.A.', 'M.A.', 'MBA'];
  for (const degree of degrees) {
    if (text.includes(degree)) {
      const startIndex = text.indexOf(degree);
      const endIndex = text.indexOf(',', startIndex);
      if (endIndex > startIndex) {
        return text.slice(startIndex, endIndex);
      } else {
        return degree;
      }
    }
  }
  return 'Degree';
}

function extractInstitutionFromEducation(text: string): string {
  // Try to find university or college names
  const eduKeywords = ['University', 'College', 'School', 'Institute'];
  for (const keyword of eduKeywords) {
    if (text.includes(keyword)) {
      const startIndex = text.indexOf(keyword);
      // Get the words before and after the keyword
      const fragment = text.slice(Math.max(0, startIndex - 15), Math.min(text.length, startIndex + 30));
      // Return the fragment, which likely contains the institution name
      return fragment;
    }
  }
  return 'Educational Institution';
}

function extractDateFromEducation(text: string): string | undefined {
  // Look for years in the format of 4 digits
  if (!text || typeof text !== 'string') {
    return undefined;
  }
  const yearMatch = text.match(/\b(19|20)\d{2}\b/g);
  if (yearMatch && yearMatch.length > 0) {
    return yearMatch.join('-');
  }
  return undefined;
}

function extractTitleFromExperience(text: string): string | undefined {
  if (!text || typeof text !== 'string') {
    return undefined;
  }
  
  // Common job titles
  const titles = ['Developer', 'Engineer', 'Manager', 'Designer', 'Director', 'Analyst', 'Coordinator', 'Specialist'];
  for (const title of titles) {
    if (text.includes(title)) {
      // Find the words before and after this title
      const index = text.indexOf(title);
      const start = Math.max(0, text.lastIndexOf(' ', Math.max(0, index - 2)));
      const end = text.indexOf(' ', index + title.length);
      if (end > index) {
        return text.slice(start, end).trim();
      } else {
        return title;
      }
    }
  }
  return undefined;
}

function extractCompanyFromExperience(text: string): string | undefined {
  if (!text || typeof text !== 'string') {
    return undefined;
  }
  // Common company indicators
  const companyKeywords = ['at ', 'with ', 'for '];
  for (const keyword of companyKeywords) {
    if (text.includes(keyword)) {
      const startIndex = text.indexOf(keyword) + keyword.length;
      const endIndex = text.indexOf(' ', startIndex + 10);
      if (endIndex > startIndex) {
        return text.slice(startIndex, endIndex).trim();
      }
    }
  }
  return undefined;
}

function extractStartDateFromExperience(text: string): string | undefined {
  if (!text || typeof text !== 'string') {
    return undefined;
  }
  
  // Look for common date patterns
  const dateMatch = text.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}/gi);
  if (dateMatch && dateMatch.length > 0) {
    return dateMatch[0];
  }
  
  // Look for years
  const yearMatch = text.match(/\b(19|20)\d{2}\b/g);
  if (yearMatch && yearMatch.length > 0) {
    return yearMatch[0];
  }
  
  return undefined;
}

function extractEndDateFromExperience(text: string): string | undefined {
  if (!text || typeof text !== 'string') {
    return undefined;
  }
  
  if (text.includes('Present') || text.includes('present') || text.includes('Current') || text.includes('current')) {
    return 'Present';
  }
  
  const dateMatches = text.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}/gi);
  if (dateMatches && dateMatches.length > 1) {
    return dateMatches[1];
  }
  
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g);
  if (yearMatches && yearMatches.length > 1) {
    return yearMatches[1];
  }
  
  return undefined;
}

function extractDescriptionFromExperience(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  // Split by common bullet point markers
  const bullets = text.split(/[•\-*]/);
  return bullets
    .map(b => b.trim())
    .filter(b => b.length > 10); // Only keep bullets with reasonable content
}
