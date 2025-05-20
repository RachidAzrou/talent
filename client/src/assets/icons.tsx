import React from 'react';

export const CompanyLogoPlaceholder = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="120"
    height="40"
    viewBox="0 0 120 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="120" height="40" rx="4" fill="#3b82f6" />
    <text
      x="60"
      y="25"
      fontFamily="Arial, sans-serif"
      fontSize="14"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
    >
      TALENTFORGE
    </text>
  </svg>
);

export const HeroImage = () => (
  <svg width="100%" height="300" viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="300" fill="#1E3A8A" />
    <rect x="100" y="50" width="1000" height="200" rx="10" fill="#2563EB" opacity="0.3" />
    <circle cx="300" cy="150" r="80" fill="#3B82F6" opacity="0.6" />
    <circle cx="900" cy="150" r="60" fill="#60A5FA" opacity="0.4" />
    <rect x="450" y="100" width="300" height="100" rx="5" fill="#93C5FD" opacity="0.2" />
    <text x="600" y="160" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="bold" fill="white" textAnchor="middle">TALENT FORGE</text>
  </svg>
);

export const ProfilePlaceholder = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="20" cy="20" r="20" fill="#E5E7EB" />
    <circle cx="20" cy="15" r="6" fill="#9CA3AF" />
    <path
      d="M10 32C10 25.373 14.477 20 20 20C25.523 20 30 25.373 30 32"
      fill="#9CA3AF"
    />
  </svg>
);

export const BusinessIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM7 19H5V17H7V19ZM7 15H5V13H7V15ZM7 11H5V9H7V11ZM7 7H5V5H7V7ZM11 19H9V17H11V19ZM11 15H9V13H11V15ZM11 11H9V9H11V11ZM11 7H9V5H11V7ZM19 19H13V17H15V15H13V13H15V11H13V9H15V7H13V5H19V19ZM17 11H15V13H17V11ZM17 7H15V9H17V7Z"
      fill="currentColor"
    />
  </svg>
);

export const RecruitmentImage = () => (
  <svg width="100%" height="200" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="200" fill="#F9FAFB" />
    
    <!-- Office desk -->
    <rect x="100" y="120" width="600" height="10" fill="#D1D5DB" />
    
    <!-- Computer -->
    <rect x="200" y="70" width="150" height="100" rx="5" fill="#9CA3AF" />
    <rect x="210" y="80" width="130" height="80" fill="#F3F4F6" />
    <rect x="250" y="170" width="50" height="10" fill="#6B7280" />
    <rect x="230" y="180" width="90" height="5" fill="#6B7280" />
    
    <!-- Person silhouette -->
    <circle cx="400" cy="60" r="20" fill="#6B7280" />
    <rect x="380" y="80" width="40" height="60" rx="5" fill="#6B7280" />
    
    <!-- Document -->
    <rect x="500" y="90" width="80" height="100" fill="white" />
    <rect x="510" y="100" width="60" height="5" fill="#E5E7EB" />
    <rect x="510" y="110" width="60" height="5" fill="#E5E7EB" />
    <rect x="510" y="120" width="40" height="5" fill="#E5E7EB" />
    <rect x="510" y="140" width="60" height="5" fill="#E5E7EB" />
    <rect x="510" y="150" width="60" height="5" fill="#E5E7EB" />
    <rect x="510" y="160" width="40" height="5" fill="#E5E7EB" />
    
    <text x="400" y="30" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#111827" textAnchor="middle">Recruitment Process Visualization</text>
  </svg>
);

export const DocumentManagementImage = () => (
  <svg width="100%" height="200" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="200" fill="#F9FAFB" />
    
    <!-- Folder -->
    <path d="M150 60H250L270 80H400V160H150V60Z" fill="#DBEAFE" />
    <path d="M150 60H250L270 80H400V90H150V60Z" fill="#93C5FD" />
    
    <!-- Documents -->
    <rect x="450" y="60" width="80" height="100" fill="white" stroke="#D1D5DB" strokeWidth="2" />
    <rect x="460" y="70" width="60" height="5" fill="#E5E7EB" />
    <rect x="460" y="80" width="60" height="5" fill="#E5E7EB" />
    <rect x="460" y="90" width="40" height="5" fill="#E5E7EB" />
    
    <rect x="550" y="70" width="80" height="100" fill="white" stroke="#D1D5DB" strokeWidth="2" />
    <rect x="560" y="80" width="60" height="5" fill="#E5E7EB" />
    <rect x="560" y="90" width="60" height="5" fill="#E5E7EB" />
    <rect x="560" y="100" width="40" height="5" fill="#E5E7EB" />
    
    <!-- Arrow -->
    <path d="M400 110H440" stroke="#6B7280" strokeWidth="2" />
    <path d="M435 105L440 110L435 115" stroke="#6B7280" strokeWidth="2" />
    
    <text x="400" y="30" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#111827" textAnchor="middle">Document Management System</text>
  </svg>
);
