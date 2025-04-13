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
import {format} from "date-fns";
import { Toaster } from "@/components/ui/toaster"

export default function Home() {

    const [date, setDate] = React.useState<Date | undefined>(new Date());

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
        <main className="flex-1 p-4">
          <MeetingInputForm />
          <WeeklyView selectedDate={date}/>
           <Toaster />
        </main>
      </div>
    </SidebarProvider>
  );
}

