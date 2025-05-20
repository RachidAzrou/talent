import React from 'react';

interface CandidateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  currentPosition?: string;
  summary?: string;
  skills?: string[];
  hobbies?: string;
  languages?: {
    language: string;
    proficiency: string;
  }[];
  certifications?: {
    name: string;
    year: string;
  }[];
  experience?: {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description?: string[];
  }[];
  education?: {
    degree: string;
    institution: string;
    location?: string;
    graduationDate: string;
  }[];
}

interface TemplateProps {
  data: CandidateData;
  companyLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const ModernProfessionalTemplate: React.FC<TemplateProps> = ({ 
  data, 
  companyLogo = "/assets/logo.png", 
  primaryColor = "#73b729", 
  secondaryColor = "#2c3242" 
}) => {
  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* Header */}
      <div className="p-6 flex justify-between items-center" style={{ backgroundColor: secondaryColor }}>
        <div>
          <h1 className="text-3xl font-bold text-white">{data.firstName} {data.lastName}</h1>
          <p className="text-lg text-gray-200 mt-1">{data.currentPosition}</p>
        </div>
        <div>
          {companyLogo && (
            <img 
              src={companyLogo} 
              alt="Company Logo" 
              className="h-12 object-contain"
            />
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex flex-1 overflow-auto">
        {/* Left sidebar */}
        <div className="w-1/3 bg-gray-50 p-6">
          {/* Contact info */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3" style={{ color: secondaryColor }}>CONTACT INFO</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-xs font-medium" style={{ color: secondaryColor }}>Email</div>
                  <div className="text-sm break-words">{data.email}</div>
                </div>
              </div>
              
              {data.phone && (
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-xs font-medium" style={{ color: secondaryColor }}>Phone</div>
                    <div className="text-sm">{data.phone}</div>
                  </div>
                </div>
              )}
              
              {data.birthDate && (
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-xs font-medium" style={{ color: secondaryColor }}>Date of Birth</div>
                    <div className="text-sm">{data.birthDate}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: secondaryColor }}>SKILLS</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 text-xs rounded-md" 
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: secondaryColor }}>LANGUAGES</h2>
              <ul className="space-y-2">
                {data.languages.map((lang, index) => (
                  <li key={index} className="flex justify-between">
                    <span className="text-sm font-medium">{lang.language}</span>
                    <span className="text-xs px-2 py-0.5 rounded" 
                      style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                      {lang.proficiency}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: secondaryColor }}>CERTIFICATIONS</h2>
              <ul className="space-y-2">
                {data.certifications.map((cert, index) => (
                  <li key={index} className="flex justify-between">
                    <span className="text-sm font-medium">{cert.name}</span>
                    <span className="text-xs text-gray-600">{cert.year}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="w-2/3 p-6">
          {/* Professional summary */}
          {data.summary && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: secondaryColor }}>PROFESSIONAL SUMMARY</h2>
              <div className="h-1 w-20 mb-3" style={{ backgroundColor: primaryColor }}></div>
              <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
            </div>
          )}
          
          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: secondaryColor }}>EXPERIENCE</h2>
              <div className="h-1 w-20 mb-3" style={{ backgroundColor: primaryColor }}></div>
              
              <div className="space-y-5">
                {data.experience.map((exp, index) => (
                  <div key={index} className="pb-5 border-b border-gray-200 last:border-0">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-bold text-gray-800">{exp.title}</h3>
                      <span className="text-sm text-gray-600">{exp.startDate} - {exp.endDate || 'Present'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-medium" style={{ color: primaryColor }}>{exp.company}</span>
                      {exp.location && (
                        <span className="text-sm text-gray-600"> • {exp.location}</span>
                      )}
                    </div>
                    {exp.description && exp.description.length > 0 && (
                      <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                        {exp.description.map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: secondaryColor }}>EDUCATION</h2>
              <div className="h-1 w-20 mb-3" style={{ backgroundColor: primaryColor }}></div>
              
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                      <p className="text-sm text-gray-700">
                        {edu.institution}
                        {edu.location && <span> • {edu.location}</span>}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600">{edu.graduationDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Hobbies & Interests */}
          {data.hobbies && (
            <div>
              <h2 className="text-lg font-bold mb-3" style={{ color: secondaryColor }}>HOBBIES & INTERESTS</h2>
              <div className="h-1 w-20 mb-3" style={{ backgroundColor: primaryColor }}></div>
              <p className="text-sm text-gray-700 leading-relaxed">{data.hobbies}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};