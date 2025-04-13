'use client'

import MeetingInputForm from '@/components/MeetingInputForm';
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {CalendarIcon} from "lucide-react";
import * as React from "react";
import {format, isSameDay} from "date-fns";
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WeeklyView from "@/components/WeeklyView";

export default function Home() {
    const [selectedDate, setDate] = React.useState<Date | undefined>(new Date());
    const [meetingDates, setMeetingDates] = React.useState<Date[]>([]);
    const [formKey, setFormKey] = React.useState(Date.now());
    const [meetingsForDate, setMeetingsForDate] = React.useState<any[]>([]);

    const handleMeetingDatesChange = (newMeetingDates: Date[]) => {
        setMeetingDates(newMeetingDates);
    };

    const handleDateChange = (date: Date | undefined) => {
        setDate(date);
    };

  React.useEffect(() => {
    // Clear local storage on component mount
    localStorage.clear();
    setMeetingDates([]);
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
                  <SidebarMenuItem>
                    <p className="px-4 py-2 font-medium text-sm">Meeting Dates</p>
                  </SidebarMenuItem>
                  {meetingDates.map((meetingDate) => (
                    <SidebarMenuItem key={meetingDate.toISOString()}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal hover:bg-secondary rounded-md px-2 py-1",
                          selectedDate && isSameDay(selectedDate, meetingDate) ? "bg-secondary" : "",
                        )}
                        onClick={() => setDate(meetingDate)}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4"/>
                        {format(meetingDate, "PPP")}
                      </Button>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <p className="px-4 py-2 font-medium text-sm">Pick a date</p>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                            variant={"ghost"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground",
                            )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4"/>
                          {selectedDate ? format(selectedDate, "PPP") : (
                              <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setDate(date);
                              setFormKey(Date.now()); // Update form key to rerender the form when date changes
                            }}
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
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList>
            <TabsTrigger value="schedule">Schedule Meeting</TabsTrigger>
            <TabsTrigger value="view">View Meetings</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule">
            <div className="bg-white rounded-lg shadow-md p-6">
                <MeetingInputForm
                    key={formKey} // Force a re-render when the date changes
                    setMeetingDates={handleMeetingDatesChange}
                    meetingDates={meetingDates}
                    selectedDate={selectedDate}
                    setDate={handleDateChange}
                    setMeetingsForDate={setMeetingsForDate}
                    meetingsForDate={meetingsForDate}
                />
            </div>
          </TabsContent>
          <TabsContent value="view">
              <WeeklyView selectedDate={selectedDate} meetingsForDate={meetingsForDate} setMeetingsForDate={setMeetingsForDate}/>
          </TabsContent>
        </Tabs>
           <Toaster />
        </main>
      </div>
    </SidebarProvider>
  );
}
