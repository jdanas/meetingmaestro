'use client';

import React, {useEffect, useState, useRef} from 'react';
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
import {sendEmail} from "@/services/email";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  date: z.date({
    required_error: "A date is required.",
  }),
  time: z.string({
    required_error: "A time is required.",
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
      time: "09:00", // Default time
      participants: [],
      description: "",
    },
  });

  const [availableParticipants, setAvailableParticipants] = useState([
    'student1@example.com',
    'student2@example.com',
    'student3@example.com',
  ]);

  const [selectedTime, setSelectedTime] = useState<string>("09:00");

  useEffect(() => {
    form.setValue("time", selectedTime);
  }, [selectedTime, form.setValue]);


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

  const handleSendEmail = async (values: Meeting) => {
    const emailList = values.participants;
    if (!emailList || emailList.length === 0) {
      toast({
        title: "No participants added",
        description: "Please add participants before sending the email.",
        variant: "destructive",
      });
      return;
    }

    const email = {
      to: values.participants,
      subject: `Meeting: ${values.title} - ${format(values.date, 'PPP')}`,
      body: `
        <h2>Meeting Details</h2>
        <p><strong>Title:</strong> ${values.title}</p>
        <p><strong>Date:</strong> ${format(values.date, 'PPP')}</p>
        <p><strong>Time:</strong> ${values.time}</p>
        <p><strong>Description:</strong> ${values.description}</p>
        <p>Please be on time and prepared for the meeting.</p>
      `,
    };

    try {
      await sendEmail(email);
      toast({
        title: "Email sent.",
        description: "Email has been sent to the participants.",
      });
    } catch (error) {
      console.error("Failed to send email", error);
      toast({
        title: "Failed to send email.",
        description: "There was an error sending the email. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const addMockParticipant = (email: string) => {
    form.setValue("participants", [...form.getValues("participants"), email]);
  };

  const clearParticipants = () => {
    form.setValue("participants", []);
  };

  const dragItem = useRef(null);

  const handleDragStart = (e: any, email: string) => {
    dragItem.current = email;
    e.dataTransfer.setData("text/plain", email);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    const droppedEmail = e.dataTransfer.getData("text/plain");
    if (droppedEmail && !form.getValues("participants").includes(droppedEmail)) {
      addMockParticipant(droppedEmail);
    }
  };

    const timeSlots = Array.from({length: 9}, (_, i) => {
      const hour = i + 9;
      const time = hour.toString().padStart(2, '0') + ":00";
      return time;
    });


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
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={field.value === time ? "secondary" : "outline"}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
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
              <FormControl onDragOver={handleDragOver} onDrop={handleDrop}>
                <Input
                  placeholder="Drag participants here"
                  {...field}
                  className="border-muted shadow-sm"
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.split(',').map(s => s.trim())
                    )
                  }
                />
              </FormControl>
              <div className="flex gap-2 mt-2">
                {availableParticipants.map((email) => (
                  <Button
                    key={email}
                    type="button"
                    variant="secondary"
                    size="sm"
                    draggable
                    onDragStart={(e) => handleDragStart(e, email)}
                  >
                    {email.split('@')[0]}
                  </Button>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={clearParticipants}>
                  Clear
                </Button>
              </div>
              <FormDescription>
                Drag participants from available list or enter emails separated by commas.
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
        <div className="flex space-x-4">
            <Button type="submit" className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/80">Submit</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.handleSubmit(handleSendEmail)(form.getValues())}
              className="bg-accent text-accent-foreground shadow-sm hover:bg-accent/80"
            >
              Send Email
            </Button>
        </div>
      </form>
    </Form>
  );
};

export default MeetingInputForm;
