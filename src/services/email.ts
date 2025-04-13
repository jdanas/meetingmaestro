/**
 * Represents the structure of an email message.
 */
export interface Email {
  /**
   * The recipient's email address.
   */
  to: string[];
  /**
   * The subject of the email.
   */
  subject: string;
  /**
   * The body of the email, can contain HTML content.
   */
  body: string;
}

/**
 * Asynchronously sends an email message.
 *
 * @param email The email object containing recipient, subject, and body.
 * @returns A promise that resolves when the email is sent successfully.
 */
export async function sendEmail(email: Email): Promise<void> {
  // TODO: Implement this by calling an email sending API.
  console.log('Sending email:', email);
  return;
}
