import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EmailHandler:
    """
    Handle email operations for sending attendance reports
    """
    
    def __init__(self, mail_server, mail_port, mail_username, mail_password):
        self.mail_server = mail_server
        self.mail_port = mail_port
        self.mail_username = mail_username
        self.mail_password = mail_password
    
    def send_attendance_report(self, recipient_email, report_data, csv_file_path=None):
        """
        Send daily attendance report
        
        Args:
            recipient_email: Email address to send to
            report_data: Dictionary with report details
            csv_file_path: Path to CSV file to attach (optional)
        """
        try:
            msg = MIMEMultipart()
            msg['From'] = self.mail_username
            msg['To'] = recipient_email
            msg['Subject'] = f"Daily Attendance Report - {datetime.now().strftime('%Y-%m-%d')}"
            
            # Create email body
            body = self._create_report_body(report_data)
            msg.attach(MIMEText(body, 'html'))
            
            # Attach CSV if provided
            if csv_file_path:
                self._attach_file(msg, csv_file_path)
            
            # Send email
            server = smtplib.SMTP(self.mail_server, self.mail_port)
            server.starttls()
            server.login(self.mail_username, self.mail_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Report sent to {recipient_email}")
            return True
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False
    
    def send_unknown_faces_alert(self, recipient_email, unknown_faces_count):
        """
        Send alert about unknown faces detected
        """
        try:
            msg = MIMEMultipart()
            msg['From'] = self.mail_username
            msg['To'] = recipient_email
            msg['Subject'] = f"Unknown Faces Alert - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            body = f"""
            <html>
                <body>
                    <h2>Unknown Faces Detected</h2>
                    <p>An alert has been generated due to unknown faces detected in the system.</p>
                    <p><strong>Total Unknown Faces: {unknown_faces_count}</strong></p>
                    <p>Please check the attendance system for more details.</p>
                    <p><em>Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</em></p>
                </body>
            </html>
            """
            msg.attach(MIMEText(body, 'html'))
            
            server = smtplib.SMTP(self.mail_server, self.mail_port)
            server.starttls()
            server.login(self.mail_username, self.mail_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Alert sent to {recipient_email}")
            return True
        except Exception as e:
            logger.error(f"Error sending alert: {str(e)}")
            return False
    
    def _create_report_body(self, report_data):
        """Create HTML email body for report"""
        total_present = report_data.get('total_present', 0)
        total_unknown = report_data.get('total_unknown', 0)
        last_updated = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        html_body = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; }}
                    .container {{ max-width: 800px; margin: 0 auto; }}
                    .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .stats {{ display: flex; justify-content: space-around; margin: 20px 0; }}
                    .stat {{ background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; }}
                    .stat h4 {{ margin: 0; color: #333; }}
                    .stat p {{ margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #4CAF50; }}
                    .unknown {{ color: #ff9800; }}
                    .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Attendance Report</h1>
                        <p>{last_updated}</p>
                    </div>
                    <div class="content">
                        <div class="stats">
                            <div class="stat">
                                <h4>Known Faces</h4>
                                <p>{total_present}</p>
                            </div>
                            <div class="stat">
                                <h4>Unknown Faces</h4>
                                <p class="unknown">{total_unknown}</p>
                            </div>
                        </div>
                        <p>Report generated automatically by AI Attendance System.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        return html_body
    
    def _attach_file(self, msg, file_path):
        """Attach file to email"""
        try:
            with open(file_path, 'rb') as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
            
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename= {file_path.split("/")[-1]}')
            msg.attach(part)
        except Exception as e:
            logger.error(f"Error attaching file: {str(e)}")
