'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';

interface Meeting {
  title: string;
  date: Date;
  time: string;
  participants: string[];
  description: string;
}

const MeetingDetailsPage: React.FC = () => {
  const { date } = useParams();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (date) {
      try {
        const parsedDate = parseISO(date as string);
        setSelectedDate(parsedDate);
      } catch (error) {
        console.error("Failed to parse date:", error);
        setSelectedDate(null);
      }
    }
  }, [date]);

  useEffect(() => {
    const storedMeetings = localStorage.getItem('meetings');
    if (storedMeetings) {
      try {
        const parsedMeetings = JSON.parse(storedMeetings) as Meeting[];
        const meetingsWithDates = parsedMeetings.map(meeting => ({
          ...meeting,
          date: new Date(meeting.date),
          time: meeting.time,
        }));
        setMeetings(meetingsWithDates);
      } catch (error) {
        console.error("Failed to parse meetings from local storage", error);
      }
    }
  }, []);

  if (!selectedDate) {
    return <div className="p-4"><h2>Invalid Date</h2><p>Please select a valid date from the sidebar.</p></div>;
  }

  const selectedMeetings = meetings.filter(meeting => {
    return meeting.date && format(meeting.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">
        Meetings for {format(selectedDate, 'PPP')}
      </h2>
      {selectedMeetings.length > 0 ? (
        <ul>
          {selectedMeetings.map((meeting, index) => (
            <li key={index} className="border rounded-md p-3 mb-3">
              <h3 className="font-semibold">{meeting.title}</h3>
              <p className="text-gray-600">Time: {meeting.time}</p>
              <p>Description: {meeting.description}</p>
              <p>Participants: {meeting.participants.join(', ')}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No meetings scheduled for this day.</p>
      )}
    </div>
  );
};

export default MeetingDetailsPage;
