// Add one short, one-sentence summary of what you have generated to the 'progress' field in the output.
'use server';

/**
 * @fileOverview Suggests optimal meeting times based on attendee availability.
 *
 * - suggestMeetingTimes - A function that suggests optimal meeting times.
 * - SuggestMeetingTimesInput - The input type for the suggestMeetingTimes function.
 * - SuggestMeetingTimesOutput - The return type for the suggestMeetingTimes function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestMeetingTimesInputSchema = z.object({
  attendees: z.array(
    z.object({
      email: z.string().email().describe('The email address of the attendee.'),
      availability: z
        .string()
        .describe(
          'The availability of the attendee, in a format like: Monday: 9am-5pm, Tuesday: 10am-6pm'
        ),
    })
  ).describe('The list of attendees and their availability.'),
  meetingDuration: z
    .number()
    .describe('The duration of the meeting in minutes.'),
  requiredBy: z.string().describe('The latest date and time that the meeting must take place by'),
  earliestStart: z.string().describe('The earliest possible time the meeting can start'),
  title: z.string().describe('Title of meeting'),
  description: z.string().describe('Description of meeting'),
});

export type SuggestMeetingTimesInput = z.infer<
  typeof SuggestMeetingTimesInputSchema
>;

const SuggestMeetingTimesOutputSchema = z.object({
  suggestedTimes: z.array(
    z.object({
      startTime: z
        .string()
        .describe(
          'The suggested start time for the meeting, in ISO 8601 format.'
        ),
      endTime: z
        .string()
        .describe(
          'The suggested end time for the meeting, in ISO 8601 format.'
        ),
      attendeesAvailable: z.array(z.string().email()).describe('List of the attendee emails that are available for the meeting during this period.')
    })
  ).describe('A list of suggested meeting times.'),
  reasoning: z.string().describe('The reason why this meeting time was selected'),
  progress: z.string().describe('A short summary of the flow progress.')
});

export type SuggestMeetingTimesOutput = z.infer<
  typeof SuggestMeetingTimesOutputSchema
>;

export async function suggestMeetingTimes(
  input: SuggestMeetingTimesInput
): Promise<SuggestMeetingTimesOutput> {
  return suggestMeetingTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMeetingTimesPrompt',
  input: {
    schema: z.object({
      attendees: z.array(
        z.object({
          email: z.string().email().describe('The email address of the attendee.'),
          availability: z
            .string()
            .describe(
              'The availability of the attendee, in a format like: Monday: 9am-5pm, Tuesday: 10am-6pm'
            ),
        })
      ).describe('The list of attendees and their availability.'),
      meetingDuration: z
        .number()
        .describe('The duration of the meeting in minutes.'),
      requiredBy: z.string().describe('The latest date and time that the meeting must take place by'),
      earliestStart: z.string().describe('The earliest possible time the meeting can start'),
      title: z.string().describe('Title of meeting'),
      description: z.string().describe('Description of meeting'),
    }),
  },
  output: {
    schema: z.object({
      suggestedTimes: z.array(
        z.object({
          startTime: z
            .string()
            .describe(
              'The suggested start time for the meeting, in ISO 8601 format.'
            ),
          endTime: z
            .string()
            .describe(
              'The suggested end time for the meeting, in ISO 8601 format.'
            ),
          attendeesAvailable: z.array(z.string().email()).describe('List of the attendee emails that are available for the meeting during this period.')
        })
      ).describe('A list of suggested meeting times.'),
      reasoning: z.string().describe('The reason why this meeting time was selected'),
      progress: z.string().describe('A short summary of the flow progress.')
    }),
  },
  prompt: `You are a meeting scheduling assistant. Given the following attendees, their availabilities, meeting title, description, and meeting duration, suggest some possible meeting times that work for most of the attendees.  Your suggestions should be as close to the earliestStart as possible, but absolutely must happen before the requiredBy date.  Explain the reasoning for each time selected.

Meeting title: {{{title}}}
Meeting description: {{{description}}}
Meeting duration: {{{meetingDuration}}} minutes
Earliest start time: {{{earliestStart}}}
Required by time: {{{requiredBy}}}

Attendees:
{{#each attendees}}
- Email: {{{email}}}, Availability: {{{availability}}}
{{/each}}

Output in JSON format, with startTime and endTime in ISO 8601 format.  List the attendee emails that can attend during the suggested time in the attendeesAvailable field.
`,
});

const suggestMeetingTimesFlow = ai.defineFlow<
  typeof SuggestMeetingTimesInputSchema,
  typeof SuggestMeetingTimesOutputSchema
>(
  {
    name: 'suggestMeetingTimesFlow',
    inputSchema: SuggestMeetingTimesInputSchema,
    outputSchema: SuggestMeetingTimesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      progress: 'Implemented AI flow to suggest optimal meeting times based on attendee availability.',
    };
  }
);
