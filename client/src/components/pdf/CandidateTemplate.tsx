import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet,
  PDFDownloadLink,
  PDFViewer,
  Image,
  Font,
  pdf as ReactPDF
} from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_0ew.woff' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZJhjp-Ek-_0ew.woff', fontWeight: 700 }
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  companyLogo: {
    width: 120,
    height: 40,
  },
  headerRight: {
    textAlign: 'right',
  },
  candidateName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  candidateTitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    padding: 4,
    backgroundColor: '#f3f4f6',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  contactItem: {
    fontSize: 10,
    marginRight: 15,
    marginBottom: 5,
  },
  content: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 10,
  },
  skills: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  skill: {
    fontSize: 9,
    backgroundColor: '#e5e7eb',
    padding: '3 6',
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  experienceItem: {
    marginBottom: 10,
  },
  experienceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  experienceCompany: {
    fontSize: 11,
    marginBottom: 3,
  },
  experienceDate: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    paddingTop: 10,
    borderTop: '1px solid #e5e7eb',
  }
});

interface ExperienceItem {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string[];
}

interface EducationItem {
  degree: string;
  institution: string;
  location?: string;
  graduationDate: string;
}

export interface CandidateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  currentPosition?: string;
  linkedinUrl?: string;
  summary?: string;
  skills?: string[];
  experience?: ExperienceItem[];
  education?: EducationItem[];
}

interface CandidateTemplateProps {
  data: CandidateData;
  companyLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const CandidateTemplate = ({ data, companyLogo }: CandidateTemplateProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {companyLogo && <Image src={companyLogo} style={styles.companyLogo} />}
        
        <View style={styles.headerRight}>
          <Text style={styles.candidateName}>{data.firstName} {data.lastName}</Text>
          {data.currentPosition && <Text style={styles.candidateTitle}>{data.currentPosition}</Text>}
        </View>
      </View>
      
      {/* Contact Information */}
      <View style={styles.contactInfo}>
        {data.email && <Text style={styles.contactItem}>Email: {data.email}</Text>}
        {data.phone && <Text style={styles.contactItem}>Phone: {data.phone}</Text>}
        {data.location && <Text style={styles.contactItem}>Location: {data.location}</Text>}
        {data.linkedinUrl && <Text style={styles.contactItem}>LinkedIn: {data.linkedinUrl}</Text>}
      </View>
      
      {/* Summary Section */}
      {data.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.content}>{data.summary}</Text>
        </View>
      )}
      
      {/* Skills Section */}
      {data.skills && data.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skills}>
            {data.skills.map((skill, index) => (
              <Text key={index} style={styles.skill}>{skill}</Text>
            ))}
          </View>
        </View>
      )}
      
      {/* Experience Section */}
      {data.experience && data.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Experience</Text>
          {data.experience.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <Text style={styles.experienceTitle}>{exp.title}</Text>
              <Text style={styles.experienceCompany}>
                {exp.company} {exp.location && `- ${exp.location}`}
              </Text>
              <Text style={styles.experienceDate}>
                {exp.startDate} - {exp.endDate || 'Present'}
              </Text>
              {exp.description && exp.description.map((desc, i) => (
                <Text key={i} style={styles.content}>• {desc}</Text>
              ))}
            </View>
          ))}
        </View>
      )}
      
      {/* Education Section */}
      {data.education && data.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={styles.experienceItem}>
              <Text style={styles.experienceTitle}>{edu.degree}</Text>
              <Text style={styles.experienceCompany}>
                {edu.institution} {edu.location && `- ${edu.location}`}
              </Text>
              <Text style={styles.experienceDate}>Graduated: {edu.graduationDate}</Text>
            </View>
          ))}
        </View>
      )}
      
      <Text style={styles.footer}>Generated by TalentForge - Recruitment Management System</Text>
    </Page>
  </Document>
);

// Template Option 1: Modern Professional
export const ModernProfessionalTemplate = ({ data, companyLogo }: CandidateTemplateProps) => {
  return (
    <div className="bg-white overflow-auto h-full shadow-lg flex flex-col">
      {/* Top Header with Logo and Name */}
      <div className="bg-[#2c3242] text-white p-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">{data.firstName} {data.lastName}</h2>
          {data.currentPosition && (
            <p className="text-lg text-[#73b729] font-medium mt-1">{data.currentPosition}</p>
          )}
        </div>
        {companyLogo && (
          <div className="bg-white p-2 rounded-md">
            <img src={companyLogo} alt="Company Logo" className="h-16 object-contain" />
          </div>
        )}
      </div>
      
      {/* Main Content with Sidebar Layout */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-200">
          {/* Contact Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#2c3242] mb-4 pb-2 border-b border-[#73b729]">
              Contact Information
            </h3>
            
            <div className="space-y-3">
              {data.email && (
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-[#73b729]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{data.email}</span>
                </div>
              )}
              
              {data.phone && (
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-[#73b729]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{data.phone}</span>
                </div>
              )}
              
              {data.location && (
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-[#73b729]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{data.location}</span>
                </div>
              )}
              
              {data.linkedinUrl && (
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-[#73b729]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span className="text-gray-700">{data.linkedinUrl}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#2c3242] mb-4 pb-2 border-b border-[#73b729]">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span key={index} className="bg-[#f0f7e6] text-[#2c3242] text-xs font-medium px-3 py-1 rounded-full border border-[#73b729]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="w-2/3 p-6">
          {/* Professional Summary */}
          {data.summary && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#2c3242] mb-4 pb-2 border-b border-[#73b729]">
                Professional Summary
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
            </div>
          )}
          
          {/* Work Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#2c3242] mb-4 pb-2 border-b border-[#73b729]">
                Work Experience
              </h3>
              <div className="space-y-6">
                {data.experience.map((exp, index) => (
                  <div key={index} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200">
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-[#73b729] -ml-1.5 ring-2 ring-white"></div>
                    <div>
                      <div className="flex justify-between">
                        <h4 className="font-bold text-[#2c3242]">{exp.title}</h4>
                        <p className="text-[#73b729] text-sm font-medium">{exp.startDate} - {exp.endDate || 'Present'}</p>
                      </div>
                      <p className="text-gray-700 font-medium mb-2">{exp.company} {exp.location && `- ${exp.location}`}</p>
                      
                      {exp.description && exp.description.length > 0 && (
                        <ul className="mt-2 text-sm list-disc text-gray-700 pl-4">
                          {exp.description.map((desc, i) => (
                            <li key={i} className="mb-1">{desc}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#2c3242] mb-4 pb-2 border-b border-[#73b729]">
                Education
              </h3>
              <div className="space-y-6">
                {data.education.map((edu, index) => (
                  <div key={index} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200">
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-[#73b729] -ml-1.5 ring-2 ring-white"></div>
                    <div>
                      <div className="flex justify-between">
                        <h4 className="font-bold text-[#2c3242]">{edu.degree}</h4>
                        <p className="text-[#73b729] text-sm font-medium">Graduated: {edu.graduationDate}</p>
                      </div>
                      <p className="text-gray-700 font-medium">{edu.institution} {edu.location && `- ${edu.location}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-[#2c3242] text-white py-3 px-6 text-center">
        <div className="flex items-center justify-center">
          <span className="text-xs">Generated by</span>
          <span className="ml-1 text-xs font-bold">TalentForge</span>
          <span className="mx-1 text-xs">-</span>
          <span className="text-xs text-[#73b729]">Recruitment Management System</span>
        </div>
      </div>
    </div>
  );
};

// Template Option 2: Executive Style
export const ExecutiveStyleTemplate = ({ data, companyLogo }: CandidateTemplateProps) => {
  return (
    <div className="bg-white overflow-auto h-full shadow-lg">
      {/* Header with professional styling */}
      <div className="p-8 bg-gray-50 border-b-4 border-[#2c3242]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold text-[#2c3242]">{data.firstName} {data.lastName}</h2>
            {data.currentPosition && (
              <p className="text-xl text-[#73b729] font-medium mt-2">{data.currentPosition}</p>
            )}
          </div>
          {companyLogo && (
            <img src={companyLogo} alt="Company Logo" className="h-20 object-contain" />
          )}
        </div>
        
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {data.email && (
            <div className="flex items-center">
              <span className="font-semibold text-[#2c3242] mr-2">Email:</span>
              <span>{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center">
              <span className="font-semibold text-[#2c3242] mr-2">Phone:</span>
              <span>{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center">
              <span className="font-semibold text-[#2c3242] mr-2">Location:</span>
              <span>{data.location}</span>
            </div>
          )}
          {data.linkedinUrl && (
            <div className="flex items-center">
              <span className="font-semibold text-[#2c3242] mr-2">LinkedIn:</span>
              <span>{data.linkedinUrl}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-8">
        {/* Professional Summary */}
        {data.summary && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#2c3242] uppercase mb-4">
              Professional Summary
            </h3>
            <div className="h-1 w-24 bg-[#73b729] mb-4"></div>
            <p className="text-base leading-relaxed text-gray-700">{data.summary}</p>
          </div>
        )}
        
        {/* Work Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#2c3242] uppercase mb-4">
              Work Experience
            </h3>
            <div className="h-1 w-24 bg-[#73b729] mb-4"></div>
            
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between mb-2">
                  <h4 className="text-lg font-bold text-[#2c3242]">{exp.title}</h4>
                  <p className="text-gray-600 font-medium">{exp.startDate} - {exp.endDate || 'Present'}</p>
                </div>
                <p className="text-[#73b729] font-semibold mb-3">{exp.company} {exp.location && `• ${exp.location}`}</p>
                
                {exp.description && exp.description.length > 0 && (
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    {exp.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#2c3242] uppercase mb-4">
              Education
            </h3>
            <div className="h-1 w-24 bg-[#73b729] mb-4"></div>
            
            <div className="space-y-5">
              {data.education.map((edu, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-[#2c3242]">{edu.degree}</h4>
                    <p className="text-gray-700">{edu.institution} {edu.location && `• ${edu.location}`}</p>
                  </div>
                  <p className="text-gray-600 font-medium">{edu.graduationDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-[#2c3242] uppercase mb-4">
              Skills
            </h3>
            <div className="h-1 w-24 bg-[#73b729] mb-4"></div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span key={index} className="bg-gray-100 text-[#2c3242] px-4 py-2 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-[#2c3242] text-white py-4 px-8 text-center">
        <div className="flex items-center justify-center">
          <span className="text-sm">Generated by</span>
          <span className="ml-1 text-sm font-bold">TalentForge</span>
          <span className="mx-1 text-sm">•</span>
          <span className="text-sm text-[#73b729]">Recruitment Management System</span>
        </div>
      </div>
    </div>
  );
};

// Template Option 3: Creative Professional
export const CreativeProfessionalTemplate = ({ data, companyLogo }: CandidateTemplateProps) => {
  return (
    <div className="bg-white overflow-auto h-full">
      {/* Creative Header */}
      <div className="relative">
        <div className="bg-[#2c3242] h-32"></div>
        <div className="bg-white mx-8 -mt-16 rounded-lg shadow-xl p-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-[#2c3242]">
              {data.firstName} <span className="text-[#73b729]">{data.lastName}</span>
            </h2>
            {data.currentPosition && (
              <p className="text-lg text-gray-600 mt-1">{data.currentPosition}</p>
            )}
          </div>
          {companyLogo && (
            <img src={companyLogo} alt="Company Logo" className="h-16 object-contain" />
          )}
        </div>
      </div>
      
      {/* Contact Bar */}
      <div className="bg-gray-100 py-3 px-8 mt-6 grid grid-cols-4 gap-2 text-center">
        {data.email && (
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#73b729] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-600">{data.email}</span>
          </div>
        )}
        {data.phone && (
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#73b729] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-xs text-gray-600">{data.phone}</span>
          </div>
        )}
        {data.location && (
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#73b729] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-gray-600">{data.location}</span>
          </div>
        )}
        {data.linkedinUrl && (
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#73b729] mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            <span className="text-xs text-gray-600">{data.linkedinUrl}</span>
          </div>
        )}
      </div>
      
      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-3 gap-8 p-8">
        {/* Left Column */}
        <div className="col-span-1">
          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-[#73b729] mr-3"></div>
                <h3 className="text-xl font-bold text-[#2c3242]">Skills</h3>
              </div>
              <div className="space-y-2">
                {data.skills.map((skill, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-2">
                    <div className="bg-[#e6f2d9] h-1.5 rounded-full">
                      <div className="bg-[#73b729] h-1.5 rounded-full w-3/4"></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm font-medium text-[#2c3242]">{skill}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-[#73b729] mr-3"></div>
                <h3 className="text-xl font-bold text-[#2c3242]">Education</h3>
              </div>
              
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-[#2c3242]">{edu.degree}</h4>
                    <p className="text-sm text-gray-700">{edu.institution}</p>
                    {edu.location && <p className="text-xs text-gray-500">{edu.location}</p>}
                    <div className="mt-2 inline-block bg-[#73b729] text-white text-xs px-2 py-1 rounded">
                      {edu.graduationDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column */}
        <div className="col-span-2">
          {/* Professional Summary */}
          {data.summary && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-[#73b729] mr-3"></div>
                <h3 className="text-xl font-bold text-[#2c3242]">Professional Summary</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">{data.summary}</p>
              </div>
            </div>
          )}
          
          {/* Work Experience */}
          {data.experience && data.experience.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-[#73b729] mr-3"></div>
                <h3 className="text-xl font-bold text-[#2c3242]">Work Experience</h3>
              </div>
              
              <div className="space-y-6">
                {data.experience.map((exp, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-bold text-[#2c3242] text-lg">{exp.title}</h4>
                      <span className="bg-[#2c3242] text-white text-xs px-2 py-1 rounded">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </span>
                    </div>
                    <p className="text-[#73b729] font-medium mb-3">{exp.company} {exp.location && `• ${exp.location}`}</p>
                    
                    {exp.description && exp.description.length > 0 && (
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
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
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-[#2c3242] text-white py-4 px-8">
        <div className="flex items-center justify-center">
          <div className="h-4 w-4 bg-[#73b729] rounded-full mr-2"></div>
          <span className="text-sm">Generated by</span>
          <span className="ml-1 text-sm font-bold">TalentForge</span>
          <span className="mx-1 text-sm">•</span>
          <span className="text-sm">Recruitment Management System</span>
        </div>
      </div>
    </div>
  );
};

// PDF View component that respects template choice
export const PDFView = ({ data, companyLogo, templateStyle }: CandidateTemplateProps & { templateStyle?: string }) => {
  // Get saved template style from localStorage or use default
  const savedStyle = templateStyle || localStorage.getItem("selectedTemplateStyle") || "modernProfessional";
  
  switch(savedStyle) {
    case "executiveStyle":
      return <ExecutiveStyleTemplate data={data} companyLogo={companyLogo} />;
    case "creativeProfessional":
      return <CreativeProfessionalTemplate data={data} companyLogo={companyLogo} />;
    case "modernProfessional":
    default:
      return <ModernProfessionalTemplate data={data} companyLogo={companyLogo} />;
  }
};

export const PDFDownloadButton = ({ 
  data, 
  companyLogo,
  fileName = "candidate_resume.pdf", 
  className = "",
  children,
  templateStyle
}: CandidateTemplateProps & { 
  fileName?: string;
  className?: string;
  children: React.ReactNode;
  templateStyle?: string;
}) => {
  // Get saved template style from localStorage or use default
  const savedStyle = templateStyle || localStorage.getItem("selectedTemplateStyle") || "modernProfessional";
  
  const getTemplate = () => {
    switch(savedStyle) {
      case "executiveStyle":
        return <ExecutiveStyleTemplate data={data} companyLogo={companyLogo} />;
      case "creativeProfessional":
        return <CreativeProfessionalTemplate data={data} companyLogo={companyLogo} />;
      case "modernProfessional":
      default:
        return <ModernProfessionalTemplate data={data} companyLogo={companyLogo} />;
    }
  };
  
  return (
    <PDFDownloadLink 
      document={getTemplate()} 
      fileName={fileName}
      className={className}
    >
      {({ blob, url, loading, error }) => 
        loading ? 'Loading document...' : children
      }
    </PDFDownloadLink>
  );
};
