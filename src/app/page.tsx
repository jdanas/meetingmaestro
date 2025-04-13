'use client'

import MeetingInputForm from '@/components/MeetingInputForm';
import WeeklyView from '@/components/WeeklyView';
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {CalendarIcon} from "lucide-react";
import * as React from "react";
import {format, isSameDay} from "date-fns";
import { Toaster } from "@/components/ui/toaster"

export default function Home() {

    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [meetingDates, setMeetingDates] = React.useState<Date[]>([]);

    React.useEffect(() => {
        const storedMeetings = localStorage.getItem('meetings');
        if (storedMeetings) {
            try {
                const parsedMeetings = JSON.parse(storedMeetings) as any[];
                const dates = parsedMeetings.map(meeting => new Date(meeting.date));
                // Remove duplicate dates
                const uniqueDates = dates.filter((date, index, self) =>
                    index === self.findIndex((t) => (
                        isSameDay(date, t)
                    ))
                );
                setMeetingDates(uniqueDates);
            } catch (error) {
                console.error("Failed to parse meetings from local storage", error);
            }
        }
    }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar collapsible="icon">
            <SidebarHeader>
              <Button variant="outline" size="sm">MeetingMaestro</Button>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {meetingDates.map((meetingDate) => (
                        <SidebarMenuItem key={meetingDate.toISOString()}>
                            <Button
                                variant={"ghost"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    date && isSameDay(date, meetingDate) ? "bg-secondary" : "",
                                )}
                                onClick={() => setDate(meetingDate)}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                {format(meetingDate, "PPP")}
                            </Button>
                        </SidebarMenuItem>
                    ))}
                  <SidebarMenuItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                            variant={"ghost"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground",
                            )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4"/>
                          {date ? format(date, "PPP") : (
                              <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <SidebarTrigger>
                <Button>Toggle Sidebar</Button>
              </SidebarTrigger>
            </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <MeetingInputForm setMeetingDates={setMeetingDates} meetingDates={meetingDates}/>
          </div>
          <div className="mt-6">
            <WeeklyView selectedDate={date}/>
          </div>
           <Toaster />
        </main>
      </div>
    </SidebarProvider>
  );
}
