'use client';

import React, { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface WeeklyViewProps {
    selectedDate: Date | undefined;
}

interface Meeting {
    title: string;
    date: Date;
    time: string;
    attendees: string[];
    students: string[];
    description: string;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({ selectedDate }) => {
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

    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 }); // Sunday
    const days = eachDayOfInterval({ start, end });

    return (
        <div>
            <h2>Weekly View</h2>
            <table className="w-full border-collapse border border-gray-400">
                <thead>
                    <tr>
                        {days.map(day => (
                            <th key={day.toISOString()} className="border border-gray-400 p-2">
                                {format(day, 'EEE dd/MM')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {days.map(day => (
                            <td key={day.toISOString()} className="border border-gray-400 p-2">
                                {/* Meeting content for each day will go here */}
                                {meetings.filter(meeting => isSameDay(new Date(meeting.date), day)).map((meeting, index) => (
                                    <div key={index}>
                                        <p>{meeting.title}</p>
                                        <p>{meeting.time}</p>
                                        {/* Display other meeting details as needed */}
                                    </div>
                                ))}
                                {meetings.filter(meeting => isSameDay(new Date(meeting.date), day)).length === 0 && (
                                    <p>No meetings</p>
                                )}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default WeeklyView;
