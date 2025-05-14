
'use client';

import React, {useEffect, useState} from 'react';
import {format, isSameDay, parse} from 'date-fns';
import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast";
import { Copy } from 'lucide-react';

interface WeeklyViewProps {
  selectedDate: Date | undefined;
    meetingsForDate: any[];
    setMeetingsForDate: (meetings: any[]) => void;
}

interface Meeting {
  title: string;
  date: Date;
  time: string;
  participants: string[];
  description: string;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({ selectedDate, meetingsForDate, setMeetingsForDate }) => {
    const {toast} = useToast();

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
        // Filter meetings for the selected date
        const filteredMeetings = meetingsWithDates.filter(meeting =>
          selectedDate && isSameDay(new Date(meeting.date), selectedDate)
        );
        setMeetingsForDate(filteredMeetings);
      } catch (error) {
        console.error("Failed to parse meetings from local storage", error);
      }
    }
  }, [selectedDate, setMeetingsForDate]);

  if (!selectedDate) {
    return <p>No date selected.</p>;
  }

  const selectedMeetings = meetingsForDate;

  // Sort meetings by time
  selectedMeetings.sort((a, b) => {
    const timeA = parse(a.time, 'HH:mm', new Date());
    const timeB = parse(b.time, 'HH:mm', new Date());
    return timeA.getTime() - timeB.getTime();
  });

  const handleCopyAllMeetings = async () => {
    if (!selectedDate) {
      toast({
        title: "No date selected",
        description: "Please select a date to copy meetings.",
        variant: "destructive",
      });
      return;
    }

    if (!meetingsForDate || meetingsForDate.length === 0) {
      toast({
        title: "No meetings scheduled",
        description: "No meetings scheduled for the selected date to copy.",
        variant: "destructive",
      });
      return;
    }

    let meetingsText = `Meetings for ${format(selectedDate, 'PPP')}:\n\n`;
    meetingsForDate.forEach((meeting, index) => {
      meetingsText += `Meeting ${index + 1}:\n`;
      meetingsText += `Title: ${meeting.title}\n`;
      meetingsText += `Date: ${format(new Date(meeting.date), 'PPP')}\n`;
      meetingsText += `Time: ${meeting.time}\n`;
      meetingsText += `Participants: ${meeting.participants.join(', ')}\n`;
      meetingsText += `Description: ${meeting.description}\n\n`;
    });

    try {
      await navigator.clipboard.writeText(meetingsText);
      toast({
        title: "Meetings Copied!",
        description: "All meeting details for this date have been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy meetings to clipboard", error);
      toast({
        title: "Copy Failed",
        description: "Could not copy meeting details to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="w-full">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Meetings for {format(selectedDate, 'PPP')}</h2>
            {selectedMeetings.length > 0 ? (
                <div>
                    {selectedMeetings.map((meeting, index) => (
                        <div key={index} className="mb-6 p-5 rounded-md shadow-sm border">
                            <p className="font-semibold text-md">{meeting.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{meeting.time}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Attendees: {meeting.participants.map((email: string) => email.split('@')[0]).join(', ')}
                            </p>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCopyAllMeetings}
                        className="bg-accent text-accent-foreground shadow-sm hover:bg-accent/80 mt-4"
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy All Meetings to Clipboard
                    </Button>
                </div>
            ) : (
                <p>No meetings scheduled for this day.</p>
            )}
        </div>
    </div>
  );
};

export default WeeklyView;
