import React, { useState } from 'react';
import SubjectManager from './SubjectManager';
import GradeManager from './GradeManager';
import ScheduleManager from './ScheduleManager';
import StudentManager from './StudentManager';

export default function TeacherPanel() {
  const [activeTab, setActiveTab] = useState('subjects');

  const tabs = [
    { id: 'subjects', label: 'Subjects' },
    { id: 'grades', label: 'Grades' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'students', label: 'Students' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'subjects':
        return <SubjectManager />;
      case 'grades':
        return <GradeManager />;
      case 'schedule':
        return <ScheduleManager />;
      case 'students':
        return <StudentManager />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">{renderContent()}</div>
    </div>
  );
} 