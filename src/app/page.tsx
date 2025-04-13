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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SuggestMeetingTimesForm from '@/components/SuggestMeetingTimesForm';

export default function Home() {
    // Move state to parent component to properly update the sidebar
    const [selectedDate, setDate] = React.useState<Date | undefined>(new Date());
    const [meetingDates, setMeetingDates] = React.useState<Date[]>([]);
    const [formKey, setFormKey] = React.useState(Date.now());

    // Callbacks for the forms to update the parent component
    const handleMeetingDatesChange = (newMeetingDates: Date[]) => {
        setMeetingDates(newMeetingDates);
    };

    const handleDateChange = (date: Date | undefined) => {
        setDate(date);
    };

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
                        variant={"ghost"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
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
        <Tabs defaultValue="schedule" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="schedule">Schedule Meeting</TabsTrigger>
            <TabsTrigger value="suggest">Suggest Times</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule">
            <div className="bg-white rounded-lg shadow-md p-6">
                <MeetingInputForm
                    key={formKey} // Force a re-render when the date changes
                    setMeetingDates={handleMeetingDatesChange}
                    meetingDates={meetingDates}
                    selectedDate={selectedDate}
                    setDate={handleDateChange}
                />
            </div>
          </TabsContent>
          <TabsContent value="suggest">
            <div className="bg-white rounded-lg shadow-md p-6">
              <SuggestMeetingTimesForm />
            </div>
          </TabsContent>
        </Tabs>
           <Toaster />
        </main>
      </div>
    </SidebarProvider>
  );
}
