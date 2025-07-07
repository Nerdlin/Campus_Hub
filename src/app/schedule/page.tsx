"use client";
import React, { useState } from "react";
import { useAuth } from '../../hooks/useAuth';
import TeacherPanel from "@/components/TeacherPanel";
import AdminPanel from "@/components/AdminPanel";
import { format, isSameDay, addDays, startOfWeek, eachDayOfInterval } from "date-fns";
import SectionTitle from '@/components/ui/SectionTitle';
import FilterBar from '@/components/ui/FilterBar';
import ScheduleCard from '@/components/ui/ScheduleCard';

export default function SchedulePage() {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const isAdmin = user?.role === "admin";
  const [selectedDay, setSelectedDay] = useState(new Date());
  const startOfCurrentWeek = startOfWeek(selectedDay, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: addDays(startOfCurrentWeek, 6),
  });
  // TODO: fetch расписание из API/user
  const schedule = user?.schedule || [];
  const filteredSchedule = schedule.filter(item =>
    item.date && isSameDay(new Date(item.date), selectedDay)
  );
  if (!user) return <div className="p-8 text-lg">Пожалуйста, войдите в систему для просмотра расписания.</div>;
  if (isAdmin) return <AdminPanel />;
  if (isTeacher) return <TeacherPanel />;
  return (
    <div className="space-y-8">
      <SectionTitle>Расписание</SectionTitle>
      <FilterBar
        filters={daysInWeek.map(day => ({
          label: format(day, 'EEE d MMM'),
          value: day.toISOString(),
        }))}
        value={selectedDay.toISOString()}
        onChange={val => setSelectedDay(new Date(val))}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchedule.length > 0 ? (
          filteredSchedule.map(item => (
            <ScheduleCard
              key={item.id}
              time={item.time}
              title={item.subject}
              type={item.type}
              location={item.room}
              teacher={item.teacher}
              status={item.status}
            />
          ))
        ) : (
          <div className="text-gray-400 col-span-full">Нет занятий на этот день.</div>
        )}
      </div>
    </div>
  );
} 