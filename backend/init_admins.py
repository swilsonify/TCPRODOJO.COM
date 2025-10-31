#!/usr/bin/env python3
"""
Initialize admin users for TC Pro Dojo Admin Panel
Run this script once to create the two admin accounts
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def init_admins():
    """Initialize two admin users"""
    
    # Check if admins already exist
    existing_admins = await db.admins.count_documents({})
    if existing_admins > 0:
        print(f"⚠️  Found {existing_admins} existing admin(s) in database")
        response = input("Do you want to reset admin accounts? (yes/no): ")
        if response.lower() != 'yes':
            print("Aborted. No changes made.")
            return
        # Delete existing admins
        await db.admins.delete_many({})
        print("✓ Existing admins deleted")
    
    # Admin 1
    print("\n=== Creating Admin Account 1 ===")
    username1 = input("Enter username for Admin 1 (default: elizabeth): ") or "elizabeth"
    password1 = input("Enter password for Admin 1 (default: Kitch3n3r22): ") or "Kitch3n3r22"
    
    admin1 = {
        "username": username1,
        "password_hash": hash_password(password1),
    }
    
    # Admin 2
    print("\n=== Creating Admin Account 2 ===")
    username2 = input("Enter username for Admin 2 (default: rodney): ") or "rodney"
    password2 = input("Enter password for Admin 2 (default: tcprodojo2025): ") or "tcprodojo2025"
    
    admin2 = {
        "username": username2,
        "password_hash": hash_password(password2),
    }
    
    # Insert admins
    await db.admins.insert_many([admin1, admin2])
    
    print("\n✅ Admin accounts created successfully!")
    print(f"\nAdmin 1: {username1}")
    print(f"Admin 2: {username2}")
    print("\n🔐 Save these credentials securely!")
    print(f"\nAdmin login URL: /admin/login")

if __name__ == "__main__":
    asyncio.run(init_admins())
    print("\n✓ Initialization complete")
