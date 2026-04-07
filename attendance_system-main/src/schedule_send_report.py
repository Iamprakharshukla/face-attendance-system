'''
This module schedules the sending of email reports
'''

import time
import schedule
import os
from database_pandas import store_dataframe_in_csv 
from send_mail import prepare_and_send_email, purge_dataframe
from parameters import EMAIL_SENDER, \
                       EMAIL_RECEIVER, \
                       EMAIL_SUBJECT, \
                       EMAIL_BODY, \
                       REPORT_PATH, \
                       EMAIL_SEND_TIME, \
                       EMAIL_SEND_WAIT_DURATION
from custom_logging import logger


def save_report_send_email():
    '''
    This function:
    1. Saves attendance/report data into CSV
    2. Sends email with report attached
    3. Clears the dataframe after sending
    '''
    try:
        logger.info(f"[INFO] Scheduled task started at {EMAIL_SEND_TIME}")

        # Step 1: Save report
        store_dataframe_in_csv()
        logger.info("[INFO] Report saved successfully")

        # Step 2: Check if file exists
        if not os.path.exists(REPORT_PATH):
            logger.error(f"[ERROR] Report file not found at {REPORT_PATH}")
            return

        # Step 3: Send email
        prepare_and_send_email(
            EMAIL_SENDER,
            EMAIL_RECEIVER,
            EMAIL_SUBJECT,
            EMAIL_BODY,
            REPORT_PATH
        )
        logger.info("[INFO] Email sent successfully")

        # Step 4: Clear dataframe
        purge_dataframe()
        logger.info("[INFO] Dataframe purged successfully")

    except Exception as e:
        logger.error(f"[ERROR] Failed to send report: {str(e)}")


def schedule_send_mail():
    '''
    This function schedules the sending of email reports daily
    at a specific time defined in parameters.py

    EMAIL_SEND_TIME format must be: "HH:MM" (24-hour format)
    Example: "21:30"

    EMAIL_SEND_WAIT_DURATION:
    Time (in seconds) between scheduler checks.
    Lower = faster response but more CPU usage.
    Recommended: 5–30 seconds
    '''

    try:
        # Validate time format
        if ":" not in EMAIL_SEND_TIME:
            raise ValueError("EMAIL_SEND_TIME must be in 'HH:MM' format")

        # Schedule the task
        schedule.every().day.at(EMAIL_SEND_TIME).do(save_report_send_email)

        logger.info(f"[INFO] Email scheduling started. Will run daily at {EMAIL_SEND_TIME}")

        # Infinite loop to keep scheduler running
        while True:
            schedule.run_pending()
            time.sleep(int(EMAIL_SEND_WAIT_DURATION))

    except Exception as e:
        logger.error(f"[ERROR] Scheduler failed: {str(e)}")


# Run scheduler
if __name__ == "__main__":
    schedule_send_mail()