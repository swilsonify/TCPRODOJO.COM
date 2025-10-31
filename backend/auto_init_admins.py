#!/usr/bin/env python3
"""
Auto-initialize admin users for TC Pro Dojo
This script automatically creates the admin accounts without prompts
"""

import asyncio
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def create_admins():
    """Create admin users automatically"""
    
    print("=" * 60)
    print("TC PRO DOJO - ADMIN INITIALIZATION")
    print("=" * 60)
    
    # Check existing admins
    existing_count = await db.admins.count_documents({})
    
    if existing_count > 0:
        print(f"\n⚠️  Found {existing_count} existing admin(s)")
        print("Deleting all existing admins...")
        result = await db.admins.delete_many({})
        print(f"✅ Deleted {result.deleted_count} admin account(s)")
    
    # Create new admins
    print("\n🔧 Creating new admin accounts...")
    
    admins = [
        {
            "username": "elizabeth",
            "password_hash": hash_password("Kitch3n3r22"),
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "username": "druonyx",
            "password_hash": hash_password("IloveHaro7dUser"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    result = await db.admins.insert_many(admins)
    
    print(f"\n✅ Successfully created {len(result.inserted_ids)} admin accounts:")
    print("\n" + "=" * 60)
    print("ADMIN CREDENTIALS")
    print("=" * 60)
    print("\nAdmin 1:")
    print(f"  Username: elizabeth")
    print(f"  Password: Kitch3n3r22")
    print("\nAdmin 2:")
    print(f"  Username: druonyx")
    print(f"  Password: IloveHaro7dUser")
    print("\n" + "=" * 60)
    print("⚠️  IMPORTANT: Change these passwords after first login!")
    print("=" * 60)
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admins())
