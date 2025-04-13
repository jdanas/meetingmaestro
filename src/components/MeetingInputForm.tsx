'use client';

import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {useToast} from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  date: z.date({
    required_error: "A date is required.",
  }),
  time: z.string().regex(/^([0-9]{2}):([0-9]{2})$/, {
    message: "Invalid time format. Use HH:MM.",
  }),
  participants: z.string().email({message: "Invalid email format."}).array()
    .transform(emails => emails.filter(email => email !== '')),
  description: z.string(),
});

type Meeting = z.infer<typeof formSchema>;

const MeetingInputForm = () => {
  const {toast} = useToast();
  const form = useForm<Meeting>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      time: "10:00",
      participants: [],
      description: "",
    },
  });

  useEffect(() => {
    // Load meetings from local storage on component mount
    const storedMeetings = localStorage.getItem('meetings');
    if (storedMeetings) {
      try {
        const parsedMeetings = JSON.parse(storedMeetings) as Meeting[];
        // You might want to set the form values to the first meeting in the array,
        // or handle multiple meetings in a different way.
        if (parsedMeetings.length > 0) {
          const firstMeeting = parsedMeetings[0];
          form.setValue("title", firstMeeting.title);
          form.setValue("date", firstMeeting.date);
          form.setValue("time", firstMeeting.time);
          form.setValue("participants", firstMeeting.participants);
          form.setValue("description", firstMeeting.description);
        }
      } catch (error) {
        console.error("Failed to parse meetings from local storage", error);
      }
    }
  }, [form]);

  function onSubmit(values: Meeting) {
    // Retrieve existing meetings from local storage
    const storedMeetings = localStorage.getItem('meetings');
    let meetings: Meeting[] = [];

    if (storedMeetings) {
      try {
        meetings = JSON.parse(storedMeetings) as Meeting[];
      } catch (error) {
        console.error("Failed to parse meetings from local storage", error);
      }
    }

    // Add the new meeting to the array
    meetings.push(values);

    // Store the updated array back in local storage
    localStorage.setItem('meetings', JSON.stringify(meetings));

    toast({
      title: "Meeting added.",
      description: "Your meeting has been saved to local storage.",
    });
  }

  const addMockParticipant = () => {
    const mockEmail = `participant${form.getValues("participants").length + 1}@example.com`;
    form.setValue("participants", [...form.getValues("participants"), mockEmail]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({field}) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Meeting Title" {...field} className="border-muted shadow-sm"/>
              </FormControl>
              <FormDescription>
                Enter the title of the meeting.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({field}) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal border-muted shadow-sm",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4"/>
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the date of the meeting.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({field}) => (
            <FormItem>
              <FormLabel>Time</FormLabel>
              <FormControl>
                <Input placeholder="HH:MM" {...field} className="border-muted shadow-sm"/>
              </FormControl>
              <FormDescription>
                Select the time of the meeting.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="participants"
          render={({field}) => (
            <FormItem>
              <FormLabel>Participants</FormLabel>
              <FormControl>
                <Input
                  placeholder="participant1@example.com, participant2@example.com"
                  {...field}
                  className="border-muted shadow-sm"
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.split(',').map(s => s.trim())
                    )
                  }
                />
              </FormControl>
              <Button type="button" variant="secondary" size="sm" onClick={addMockParticipant}>Add Mock Participant</Button>
              <FormDescription>
                Enter the list of participants, separated by commas.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({field}) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a description for the meeting."
                  className="resize-none border-muted shadow-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe the purpose of this meeting.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/80">Submit</Button>
      </form>
    </Form>
  );
};

export default MeetingInputForm;
