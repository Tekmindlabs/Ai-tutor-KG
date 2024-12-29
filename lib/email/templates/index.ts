import * as React from 'react';


export interface EmailTemplate {

  subject: string;

  html?: string;

  component?: React.ReactElement;

}

export function welcomeEmail(name: string): EmailTemplate {
  return {
    subject: 'Welcome to AI Tutor - Your Learning Journey Begins!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to AI Tutor, ${name}! 🎉</h1>
        <p>We're thrilled to have you join our learning community!</p>
        <p>Your personalized AI tutor is ready to help you achieve your learning goals.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/chat" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Start Learning Now
          </a>
        </div>
        <p>Get ready for an exciting learning journey!</p>
        <p>Best regards,<br>The AI Tutor Team</p>
      </div>
    `
  };
}

export function signInEmail(name: string, url: string): EmailTemplate {
  return {
    subject: 'Sign in to AI Tutor',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome Back, ${name}! 👋</h1>
        <p>Click the button below to sign in to your AI Tutor account:</p>
        <div style="margin: 30px 0;">
          <a href="${url}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Sign In to AI Tutor
          </a>
        </div>
        <p>If you didn't request this email, you can safely ignore it.</p>
      </div>
    `
  };
}