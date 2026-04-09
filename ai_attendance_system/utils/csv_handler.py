import csv
import os
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CSVHandler:
    """
    Handle CSV operations for attendance and face records
    """
    
    def __init__(self, attendance_csv, unknown_faces_csv, known_faces_csv):
        self.attendance_csv = attendance_csv
        self.unknown_faces_csv = unknown_faces_csv
        self.known_faces_csv = known_faces_csv
        self._ensure_files_exist()
    
    def _ensure_files_exist(self):
        """Create CSV files if they don't exist"""
        os.makedirs(os.path.dirname(self.attendance_csv), exist_ok=True)
        
        # Create attendance CSV
        if not os.path.exists(self.attendance_csv):
            with open(self.attendance_csv, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['Date', 'Time', 'Person_Name', 'Confidence', 'Status', 'Source'])
        
        # Create unknown faces CSV
        if not os.path.exists(self.unknown_faces_csv):
            with open(self.unknown_faces_csv, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['Date', 'Time', 'Confidence', 'Image_Path', 'Source'])
        
        # Create known faces CSV
        if not os.path.exists(self.known_faces_csv):
            with open(self.known_faces_csv, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['Person_Name', 'Registration_Date', 'Total_Attendance', 'Last_Seen'])
    
    def log_attendance(self, person_name, confidence, source='webcam'):
        """
        Log attendance record
        source: 'webcam', 'phone', 'upload', 'video'
        """
        try:
            now = datetime.now()
            date = now.strftime('%Y-%m-%d')
            time = now.strftime('%H:%M:%S')
            status = 'Present'
            
            with open(self.attendance_csv, 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([date, time, person_name, f'{confidence:.4f}', status, source])
            
            logger.info(f"Logged attendance for {person_name}")
            return True
        except Exception as e:
            logger.error(f"Error logging attendance: {str(e)}")
            return False
    
    def log_unknown_face(self, confidence, image_path, source='webcam'):
        """
        Log unknown face detection
        """
        try:
            now = datetime.now()
            date = now.strftime('%Y-%m-%d')
            time = now.strftime('%H:%M:%S')
            
            with open(self.unknown_faces_csv, 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([date, time, f'{confidence:.4f}', image_path, source])
            
            logger.info(f"Logged unknown face with confidence {confidence:.4f}")
            return True
        except Exception as e:
            logger.error(f"Error logging unknown face: {str(e)}")
            return False
    
    def register_known_face(self, person_name):
        """
        Register a new known person
        """
        try:
            now = datetime.now()
            date = now.strftime('%Y-%m-%d')
            
            # Check if person already exists
            existing = self.get_person_record(person_name)
            if existing:
                return False  # Person already registered
            
            with open(self.known_faces_csv, 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([person_name, date, 0, date])
            
            logger.info(f"Registered new person: {person_name}")
            return True
        except Exception as e:
            logger.error(f"Error registering person: {str(e)}")
            return False
    
    def update_person_record(self, person_name):
        """
        Update person's last seen time and attendance count
        """
        try:
            rows = []
            updated = False
            
            with open(self.known_faces_csv, 'r', newline='') as f:
                reader = csv.reader(f)
                headers = next(reader)
                
                for row in reader:
                    if row[0] == person_name:
                        row[2] = str(int(row[2]) + 1)  # Increment attendance
                        row[3] = datetime.now().strftime('%Y-%m-%d')  # Update last seen
                        updated = True
                    rows.append(row)
            
            if updated:
                with open(self.known_faces_csv, 'w', newline='') as f:
                    writer = csv.writer(f)
                    writer.writerow(headers)
                    writer.writerows(rows)
                return True
            
            return False
        except Exception as e:
            logger.error(f"Error updating person record: {str(e)}")
            return False
    
    def get_person_record(self, person_name):
        """Get person's record from known faces CSV"""
        try:
            with open(self.known_faces_csv, 'r', newline='') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row['Person_Name'] == person_name:
                        return row
            return None
        except Exception as e:
            logger.error(f"Error getting person record: {str(e)}")
            return None
    
    def get_all_attendance_today(self):
        """Get all attendance records for today"""
        try:
            today = datetime.now().strftime('%Y-%m-%d')
            records = []
            
            with open(self.attendance_csv, 'r', newline='') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row['Date'] == today:
                        records.append(row)
            
            return records
        except Exception as e:
            logger.error(f"Error getting today's attendance: {str(e)}")
            return []
    
    def get_attendance_report(self, start_date, end_date):
        """Get attendance report for date range"""
        try:
            records = []
            
            with open(self.attendance_csv, 'r', newline='') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    row_date = datetime.strptime(row['Date'], '%Y-%m-%d').date()
                    if start_date <= row_date <= end_date:
                        records.append(row)
            
            return records
        except Exception as e:
            logger.error(f"Error getting attendance report: {str(e)}")
            return []
    
    def export_csv(self, csv_file, filename):
        """Export CSV file content"""
        try:
            with open(csv_file, 'r') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error exporting CSV: {str(e)}")
            return None
