'use client';

import React from 'react';
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
import {useToast} from "@/hooks/use-toast";
import {suggestMeetingTimes} from '@/ai/flows/suggest-meeting-times';

const suggestMeetingTimesFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string(),
  meetingDuration: z.number().min(15, {
    message: "Meeting duration must be at least 15 minutes.",
  }).max(120, {
    message: "Meeting duration cannot exceed 120 minutes.",
  }),
  requiredBy: z.string(),
  earliestStart: z.string(),
  attendees: z.array(
    z.object({
      email: z.string().email({message: "Invalid email format."}),
      availability: z.string(),
    })
  ).min(1, {
    message: "At least one attendee is required.",
  }),
});

type SuggestMeetingTimesFormValues = z.infer<typeof suggestMeetingTimesFormSchema>;

const SuggestMeetingTimesForm = () => {
  const {toast} = useToast();
  const form = useForm<SuggestMeetingTimesFormValues>({
    resolver: zodResolver(suggestMeetingTimesFormSchema),
    defaultValues: {
      title: "",
      description: "",
      meetingDuration: 60,
      requiredBy: "",
      earliestStart: "",
      attendees: [{email: "", availability: ""}],
    },
  });

  async function onSubmit(values: SuggestMeetingTimesFormValues) {
    try {
      const suggestedTimes = await suggestMeetingTimes({
        title: values.title,
        description: values.description,
        meetingDuration: values.meetingDuration,
        requiredBy: values.requiredBy,
        earliestStart: values.earliestStart,
        attendees: values.attendees,
      });

      toast({
        title: "Suggested Meeting Times",
        description: suggestedTimes.suggestedTimes.map((time, index) => (
          <div key={index}>
            {`Start: ${time.startTime}, End: ${time.endTime}, Attendees: ${time.attendeesAvailable.join(', ')}`}
          </div>
        )),
      });
    } catch (error: any) {
      console.error("Error suggesting meeting times", error);
      toast({
        title: "Error",
        description: error.message || "Failed to suggest meeting times. Please try again.",
        variant: "destructive",
      });
    }
  }

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
        <FormField
          control={form.control}
          name="meetingDuration"
          render={({field}) => (
            <FormItem>
              <FormLabel>Meeting Duration (minutes)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="60" {...field} className="border-muted shadow-sm"/>
              </FormControl>
              <FormDescription>
                Enter the duration of the meeting in minutes.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requiredBy"
          render={({field}) => (
            <FormItem>
              <FormLabel>Required By (ISO Date and Time)</FormLabel>
              <FormControl>
                <Input placeholder="YYYY-MM-DDTHH:mm:ssZ" {...field} className="border-muted shadow-sm"/>
              </FormControl>
              <FormDescription>
                Enter the date and time by which the meeting must take place.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="earliestStart"
          render={({field}) => (
            <FormItem>
              <FormLabel>Earliest Start (ISO Date and Time)</FormLabel>
              <FormControl>
                <Input placeholder="YYYY-MM-DDTHH:mm:ssZ" {...field} className="border-muted shadow-sm"/>
              </FormControl>
              <FormDescription>
                Enter the earliest possible start time for the meeting.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="attendees"
          render={({field}) => (
            <FormItem>
              <FormLabel>Attendees</FormLabel>
              {field.value.map((attendee, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <div className="flex-1">
                    <FormLabel htmlFor={`attendees[${index}].email`}>Email</FormLabel>
                    <Input
                      id={`attendees[${index}].email`}
                      placeholder="email@example.com"
                      value={attendee.email}
                      onChange={(e) => {
                        const newAttendees = [...field.value];
                        newAttendees[index].email = e.target.value;
                        field.onChange(newAttendees);
                      }}
                      className="border-muted shadow-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <FormLabel htmlFor={`attendees[${index}].availability`}>Availability</FormLabel>
                    <Input
                      id={`attendees[${index}].availability`}
                      placeholder="Monday: 9am-5pm, Tuesday: 10am-6pm"
                      value={attendee.availability}
                      onChange={(e) => {
                        const newAttendees = [...field.value];
                        newAttendees[index].availability = e.target.value;
                        field.onChange(newAttendees);
                      }}
                      className="border-muted shadow-sm"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  field.onChange([...field.value, {email: "", availability: ""}]);
                }}
              >
                Add Attendee
              </Button>
              <FormDescription>
                Enter the email and availability for each attendee.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/80">
          Suggest Meeting Times
        </Button>
      </form>
    </Form>
  );
};

export default SuggestMeetingTimesForm;

