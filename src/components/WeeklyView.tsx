'use client';

import React, {useEffect, useState} from 'react';
import {format, isSameDay, parse} from 'date-fns';

interface WeeklyViewProps {
  selectedDate: Date | undefined;
}

interface Meeting {
  title: string;
  date: Date;
  time: string;
  participants: string[];
  description: string;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({selectedDate}) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    // Load meetings from local storage on component mount
    const storedMeetings = localStorage.getItem('meetings');
    if (storedMeetings) {
      try {
        const parsedMeetings = JSON.parse(storedMeetings) as Meeting[];
        // Convert date strings to Date objects
        const meetingsWithDates = parsedMeetings.map(meeting => ({
          ...meeting,
          date: new Date(meeting.date), // Assuming meeting.date is an ISO string
          time: meeting.time,
        }));
        setMeetings(meetingsWithDates);
      } catch (error) {
        console.error("Failed to parse meetings from local storage", error);
      }
    }
  }, []);

  if (!selectedDate) {
    return <p>No date selected.</p>;
  }

  const selectedMeetings = meetings.filter(meeting => isSameDay(new Date(meeting.date), selectedDate));

  // Sort meetings by time
  selectedMeetings.sort((a, b) => {
    const timeA = parse(a.time, 'HH:mm', new Date());
    const timeB = parse(b.time, 'HH:mm', new Date());
    return timeA.getTime() - timeB.getTime();
  });

  return (
    <div>
      <h2>Meetings for {format(selectedDate, 'PPP')}</h2>
      {selectedMeetings.length > 0 ? (
        <div>
          {selectedMeetings.map((meeting, index) => (
            <div key={index} className="mb-4 p-4 rounded-md shadow-sm border">
              <p className="font-semibold">{meeting.title}</p>
              <p className="text-sm text-muted-foreground">{meeting.time}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No meetings scheduled for this day.</p>
      )}
    </div>
  );
};

export default WeeklyView;

