function VerifyEmail({ url, token, email, request }: { url: string, token?: string, email?: string, request?: Request }): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f4f4f5;
      ">
        <div style="
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        ">
          <div style="
            background-color: white;
            border-radius: 8px;
            padding: 40px 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          ">
            <h1 style="
              color: #18181b;
              font-size: 24px;
              margin-bottom: 20px;
            ">Welcome to Clasher's Academy! 🎓</h1>
            
            <p style="
              color: #3f3f46;
              font-size: 16px;
              margin-bottom: 30px;
            ">Click the button below to verify your email address and get started with your learning journey.</p>
            
            <a href="${url}" style="
              display: inline-block;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: 500;
              margin-bottom: 30px;
            ">Verify Email Address</a>
            
            <p style="
              color: #71717a;
              font-size: 14px;
              margin-bottom: 0;
            ">If you didn't request this email, you can safely ignore it.</p>
          </div>
          
          <div style="
            text-align: center;
            margin-top: 20px;
            color: #71717a;
            font-size: 12px;
          ">
            <p>© ${new Date().getFullYear()} Clasher's Academy. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export default VerifyEmail;