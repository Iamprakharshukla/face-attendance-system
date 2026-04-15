import os
import json
import hashlib
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, id, username, email, password_hash, full_name='', role='user'):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.full_name = full_name
        self.role = role

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'password_hash': self.password_hash,
            'full_name': self.full_name,
            'role': self.role
        }

    @staticmethod
    def from_dict(data):
        return User(
            id=data['id'],
            username=data['username'],
            email=data['email'],
            password_hash=data['password_hash'],
            full_name=data.get('full_name', ''),
            role=data.get('role', 'user')
        )

class UserManager:
    def __init__(self, users_file='data/users.json'):
        self.users_file = users_file
        self.users = {}
        self._load_users()

    def _load_users(self):
        """Load users from JSON file"""
        if os.path.exists(self.users_file):
            try:
                with open(self.users_file, 'r') as f:
                    data = json.load(f)
                    for user_data in data.values():
                        user = User.from_dict(user_data)
                        self.users[user.id] = user
            except (json.JSONDecodeError, KeyError):
                self.users = {}

    def _save_users(self):
        """Save users to JSON file"""
        os.makedirs(os.path.dirname(self.users_file), exist_ok=True)
        data = {user_id: user.to_dict() for user_id, user in self.users.items()}
        with open(self.users_file, 'w') as f:
            json.dump(data, f, indent=2)

    def create_user(self, username, email, password, full_name=''):
        """Create a new user"""
        if self.get_user_by_username(username):
            raise ValueError("Username already exists")
        if self.get_user_by_email(email):
            raise ValueError("Email already exists")

        user_id = str(len(self.users) + 1)
        user = User(user_id, username, email, '', full_name)
        user.set_password(password)
        self.users[user_id] = user
        self._save_users()
        return user

    def get_user(self, user_id):
        """Get user by ID"""
        return self.users.get(user_id)

    def get_user_by_username(self, username):
        """Get user by username"""
        for user in self.users.values():
            if user.username == username:
                return user
        return None

    def get_user_by_email(self, email):
        """Get user by email"""
        for user in self.users.values():
            if user.email == email:
                return user
        return None

    def authenticate(self, username_or_email, password):
        """Authenticate user"""
        user = self.get_user_by_username(username_or_email) or self.get_user_by_email(username_or_email)
        if user and user.check_password(password):
            return user
        return None

    def get_all_users(self):
        """Get all users"""
        return list(self.users.values())

# Create a global instance
user_manager = UserManager()