import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { emailConfig } from 'src/common/config/env.config';
import { convertEmailToText } from 'src/common/utils/utils.service';
import { UserService } from '../user/user.service';

export interface Mail {
  email: string;
  firstName?: string;
  OTP?: number | string;
  subject: string;
}

@Injectable()
export class NotificationsService {
  private emailFrom = emailConfig.EMAIL_FROM;
  private baseUrl = emailConfig.BASE_URL;
  private MAIL_HOST = emailConfig.MAIL_HOST;
  private MAIL_USERNAME = emailConfig.MAIL_USERNAME;
  private MAIL_PASSWORD = emailConfig.MAIL_PASSWORD;
  private MAIL_PORT = emailConfig.MAIL_PORT;

  constructor(private readonly usersService: UserService) {}

  async sendMail(options: Mail, template: string): Promise<any> {
    const text = convertEmailToText(template);
    const msg: any = {
      to: options.email,
      from: this.emailFrom, // Use the email address or domain you verified above
      subject: options.subject,
      text,
      html: template,
    };

    try {
      if (process.env.NODE_ENV === 'production') {
        const transporter = nodemailer.createTransport({
          host: this.MAIL_HOST,
          port: Number(this.MAIL_PORT),
          auth: {
            user: this.MAIL_USERNAME,
            pass: this.MAIL_PASSWORD,
          },
        });
        // send the email with nodemailer
        try {
          const result = await transporter.sendMail(msg);
          return result;
        } catch (error: any) {
          console.log(error);
          if (error.response) {
            console.error(error.response.body);
          }
        }
      }
      const transporter = nodemailer.createTransport({
        host: this.MAIL_HOST,
        port: Number(this.MAIL_PORT),
        secure: true,
        auth: {
          user: this.MAIL_USERNAME,
          pass: this.MAIL_PASSWORD,
        },
      });
      // send the email with nodemailer
      const result = await transporter.sendMail(msg);
      return result;
    } catch (err) {
      console.log(err);
    }
  }

  async sendDraftingIntervalMessages(options: Mail) {
    const message = `
      <p>Hello, from DUGOUT</p>
      <p>We are excited to inform you that the **drafting session is about to begin!**</p>
      <p>Here are the key details:</p>
      <ul>
        <li><strong>Start Time:</strong> 4:30 PM</li>
        <li><strong>End Time:</strong> 5:30 PM</li>
      </ul>
      <p>It's time to create your winning strategy and assemble your dream team.</p>
      <p>Don't miss this opportunity! Head over to your dashboard now to start drafting and secure the best picks before time runs out.</p>
      <p>Remember, your decisions during this session could be the key to victory!</p>
      <p>Good luck and happy drafting!</p>
      <p>Best Regards,<br/>The DUGOUT Team</p>
    `;
    const result = await this.sendMail(options, message);
    return result;
  }

  async sendDraftingEmailAtIntervals() {
    const arrayOfUsers = await this.usersService.findAll();
    let arrayOfEmail: any = [];
    if (arrayOfUsers !== null) {
      arrayOfEmail = arrayOfUsers.map((item: any) => {
        return item.email;
      });
    }
    const emailInfo = {
      from: this.emailFrom as string,
      email: arrayOfEmail.join(','),
      subject:
        'Important: Drafting Starts at 4:30 PM! Build Your Dream Team Now 🚀',
    };
    await this.sendDraftingIntervalMessages(emailInfo);
  }

  async sendGroupCreationIntervalMessages(options: Mail) {
    const message = `
      <p>Hello, from DUGOUT</p>
      <p>We are thrilled to announce that the **group creation and joining session is about to begin!**</p>
      <p>Here are the key details:</p>
      <ul>
        <li><strong>Start Time:</strong> 1:00 AM(Today)</li>
        <li><strong>End Time:</strong> 1:00 AM (Friday)</li>
      </ul>
      <p>This is your chance to form or join a group and set the stage for an exciting experience ahead.</p>
      <p>Don't wait too long! Head over to your dashboard now to create or join a group before the session ends.</p>
      <p>Seize this opportunity to connect, strategize, and prepare for an epic journey with your team!</p>
      <p>Good luck and happy group creation!</p>
      <p>Best Regards,<br/>The DUGOUT Team</p>
    `;
    const result = await this.sendMail(options, message);
    return result;
  }

  async sendCreateGroupEmailAtIntervals() {
    const arrayOfUsers = await this.usersService.findAll();
    let arrayOfEmail: any = [];
    if (arrayOfUsers !== null) {
      arrayOfEmail = arrayOfUsers.map((item: any) => {
        return item.email;
      });
    }
    const emailInfo = {
      from: this.emailFrom as string,
      email: arrayOfEmail.join(','),
      subject: "Important: Group Creation & Joining Opens Now! Don't Miss Out!",
    };
    await this.sendGroupCreationIntervalMessages(emailInfo);
  }
}
