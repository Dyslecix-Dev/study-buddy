import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, severity, userEmail, userName } = body;

    if (!title || !description || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate severity
    const severityEmojiMap: Record<string, string> = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    };

    if (!severityEmojiMap[severity]) {
      return NextResponse.json({ error: 'Invalid severity level' }, { status: 400 });
    }

    const severityEmoji = severityEmojiMap[severity];

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Study Buddy Bug Reports <bug-reports@study-buddy.dyslecix.dev>',
      to: 'dyslecixdev@gmail.com',
      subject: `${severityEmoji} Bug Report: ${title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 8px 8px;
              }
              .field {
                margin-bottom: 20px;
              }
              .field-label {
                font-weight: 600;
                color: #555;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
              }
              .field-value {
                background: white;
                padding: 12px;
                border-radius: 6px;
                border-left: 3px solid #667eea;
              }
              .severity {
                display: inline-block;
                padding: 6px 12px;
                border-radius: 20px;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 12px;
              }
              .severity-low { background: #d1fae5; color: #065f46; }
              .severity-medium { background: #fef3c7; color: #92400e; }
              .severity-high { background: #fed7aa; color: #9a3412; }
              .severity-critical { background: #fee2e2; color: #991b1b; }
              .description {
                white-space: pre-wrap;
                line-height: 1.8;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🐛 New Bug Report</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">Bug Title</div>
                <div class="field-value">
                  <strong>${title}</strong>
                </div>
              </div>

              <div class="field">
                <div class="field-label">Severity</div>
                <div class="field-value">
                  <span class="severity severity-${severity}">${severityEmoji} ${severity.toUpperCase()}</span>
                </div>
              </div>

              <div class="field">
                <div class="field-label">Description</div>
                <div class="field-value description">${description}</div>
              </div>

              <div class="field">
                <div class="field-label">Reported By</div>
                <div class="field-value">
                  ${userName || 'Unknown User'} (${userEmail})
                </div>
              </div>

              <div class="field">
                <div class="field-label">User ID</div>
                <div class="field-value">
                  <code>${user.id}</code>
                </div>
              </div>

              <div class="field">
                <div class="field-label">Timestamp</div>
                <div class="field-value">
                  ${new Date().toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'long'
                  })}
                </div>
              </div>

              <div class="footer">
                This bug report was automatically generated from Study Buddy
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send bug report email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: data?.id }, { status: 200 });
  } catch (error) {
    console.error('Error submitting bug report:', error);
    return NextResponse.json({ error: 'Failed to submit bug report' }, { status: 500 });
  }
}
