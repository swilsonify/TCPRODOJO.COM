from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import shutil
import cloudinary
import cloudinary.uploader
import cloudinary.api


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True
)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Wrestling Class Models
class WrestlingClass(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: int
    day: str
    time: str
    title: str
    instructor: str
    level: str
    spots: int

# Booking Models
class BookingCreate(BaseModel):
    class_id: int
    name: str
    email: str
    date: str

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    class_id: int
    name: str
    email: str
    date: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Contact Form Models
class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    subject: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    subject: str
    message: str


# Admin Authentication Models
SECRET_KEY = os.environ.get('JWT_SECRET', 'tcprodojo-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

security = HTTPBearer()

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Admin Content Models
class EventModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    date: str
    time: str
    location: str
    description: str
    attendees: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TrainerModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    aka: str = ""
    title: str
    specialty: str
    experience: str
    bio: str
    achievements: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TestimonialModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    text: str
    photoUrl: str = ""
    videoUrl: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GalleryModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    section: str
    type: str  # 'image' or 'video'
    url: str
    description: str = ""
    displayOrder: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CoachModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    aka: str = ""
    title: str
    specialty: str
    experience: str
    bio: str
    achievements: list = []
    photo_url: str = ""
    displayOrder: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SuccessStoryModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    promotion: str
    achievement: str
    yearGraduated: str
    bio: str
    photo_url: str = ""
    displayOrder: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EndorsementModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    videoUrl: str
    description: str = ""
    displayOrder: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Helper functions for admin auth
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Classes Endpoints
@api_router.get("/classes", response_model=List[WrestlingClass])
async def get_classes():
    # Return default classes with both wrestling and boxing
    default_classes = [
        # PRO WRESTLING CLASSES
        {"id": 1, "day": "Monday", "time": "6:00 PM - 8:00 PM", "title": "Beginner Pro Wrestling", "instructor": "Coach Mike", "level": "Beginner", "spots": 8},
        {"id": 2, "day": "Monday", "time": "8:00 PM - 10:00 PM", "title": "Advanced Pro Wrestling", "instructor": "Coach Sarah", "level": "Advanced", "spots": 5},
        {"id": 3, "day": "Tuesday", "time": "7:00 PM - 9:00 PM", "title": "High-Flying & Lucha", "instructor": "Coach James", "level": "Intermediate", "spots": 6},
        {"id": 4, "day": "Wednesday", "time": "6:00 PM - 8:00 PM", "title": "Ring Psychology & Promos", "instructor": "Coach Mike", "level": "All Levels", "spots": 10},
        {"id": 5, "day": "Thursday", "time": "7:00 PM - 9:00 PM", "title": "Technical Wrestling", "instructor": "Coach Sarah", "level": "Intermediate", "spots": 7},
        {"id": 6, "day": "Friday", "time": "6:00 PM - 8:00 PM", "title": "Pro Wrestling Fundamentals", "instructor": "Coach Mike", "level": "Beginner", "spots": 8},
        {"id": 7, "day": "Friday", "time": "8:00 PM - 10:00 PM", "title": "Pro Wrestling Sparring", "instructor": "All Coaches", "level": "Advanced", "spots": 10},
        {"id": 8, "day": "Saturday", "time": "10:00 AM - 12:00 PM", "title": "Pro Pathway Weekend Training", "instructor": "Coach James", "level": "All Levels", "spots": 15},
        # BOXING CLASSES
        {"id": 9, "day": "Monday", "time": "5:00 PM - 6:30 PM", "title": "Boxing Beginners", "instructor": "Coach Tony", "level": "Beginner", "spots": 12},
        {"id": 10, "day": "Tuesday", "time": "6:00 PM - 7:30 PM", "title": "Advanced Boxing", "instructor": "Coach Tony", "level": "Advanced", "spots": 8},
        {"id": 11, "day": "Wednesday", "time": "5:00 PM - 6:30 PM", "title": "Boxing Technique", "instructor": "Coach Marcus", "level": "Intermediate", "spots": 10},
        {"id": 12, "day": "Thursday", "time": "6:00 PM - 7:30 PM", "title": "Boxing Sparring", "instructor": "Coach Tony", "level": "Advanced", "spots": 6},
        {"id": 13, "day": "Saturday", "time": "9:00 AM - 10:30 AM", "title": "Self-Defense Boxing", "instructor": "Coach Marcus", "level": "All Levels", "spots": 15},
        # FITNESS
        {"id": 14, "day": "Wednesday", "time": "8:00 PM - 10:00 PM", "title": "Strength & Conditioning", "instructor": "Coach Tony", "level": "All Levels", "spots": 12},
        {"id": 15, "day": "Saturday", "time": "2:00 PM - 4:00 PM", "title": "Pro Athlete Training", "instructor": "Coach Sarah", "level": "Advanced", "spots": 5},
    ]
    return default_classes

# Bookings Endpoints
@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate):
    booking = Booking(**booking_data.model_dump())
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = booking.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    try:
        await db.bookings.insert_one(doc)
        logger.info(f"Booking created: {booking.name} for class {booking.class_id}")
    except Exception as e:
        logger.error(f"Error creating booking: {e}")
    
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings():
    bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for booking in bookings:
        if isinstance(booking.get('created_at'), str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    
    return bookings

# Contact Form Endpoints
@api_router.post("/contact", response_model=ContactMessage)
async def submit_contact(contact_data: ContactCreate):
    contact = ContactMessage(**contact_data.model_dump())
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = contact.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    try:
        await db.contacts.insert_one(doc)
        logger.info(f"Contact form submitted: {contact.name} - {contact.subject}")
    except Exception as e:
        logger.error(f"Error submitting contact form: {e}")
    
    return contact

@api_router.get("/contacts", response_model=List[ContactMessage])
async def get_contacts():
    contacts = await db.contacts.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for contact in contacts:
        if isinstance(contact.get('created_at'), str):
            contact['created_at'] = datetime.fromisoformat(contact['created_at'])
    
    return contacts


# ==================== ADMIN ROUTES ====================

# Admin Authentication
@api_router.post("/admin/login", response_model=Token)
async def admin_login(login_data: AdminLogin):
    # Check if user exists
    admin = await db.admins.find_one({"username": login_data.username}, {"_id": 0})
    
    if not admin or not verify_password(login_data.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": login_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/admin/verify")
async def verify_admin(username: str = Depends(verify_token)):
    return {"username": username, "authenticated": True}

# Admin Event Management
@api_router.get("/admin/events", response_model=List[EventModel])
async def get_admin_events(username: str = Depends(verify_token)):
    events = await db.events.find({}, {"_id": 0}).to_list(1000)
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
    return events

@api_router.post("/admin/events", response_model=EventModel)
async def create_event(event: EventModel, username: str = Depends(verify_token)):
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.events.insert_one(doc)
    return event

@api_router.put("/admin/events/{event_id}", response_model=EventModel)
async def update_event(event_id: str, event: EventModel, username: str = Depends(verify_token)):
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.events.update_one({"id": event_id}, {"$set": doc})
    return event

@api_router.delete("/admin/events/{event_id}")
async def delete_event(event_id: str, username: str = Depends(verify_token)):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

# Admin Trainer Management
@api_router.get("/admin/trainers", response_model=List[TrainerModel])
async def get_admin_trainers(username: str = Depends(verify_token)):
    trainers = await db.trainers.find({}, {"_id": 0}).to_list(1000)
    for trainer in trainers:
        if isinstance(trainer.get('created_at'), str):
            trainer['created_at'] = datetime.fromisoformat(trainer['created_at'])
    return trainers

@api_router.post("/admin/trainers", response_model=TrainerModel)
async def create_trainer(trainer: TrainerModel, username: str = Depends(verify_token)):
    doc = trainer.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.trainers.insert_one(doc)
    return trainer

@api_router.put("/admin/trainers/{trainer_id}", response_model=TrainerModel)
async def update_trainer(trainer_id: str, trainer: TrainerModel, username: str = Depends(verify_token)):
    doc = trainer.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.trainers.update_one({"id": trainer_id}, {"$set": doc})
    return trainer

@api_router.delete("/admin/trainers/{trainer_id}")
async def delete_trainer(trainer_id: str, username: str = Depends(verify_token)):
    result = await db.trainers.delete_one({"id": trainer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return {"message": "Trainer deleted successfully"}

# Admin Testimonial Management
@api_router.get("/admin/testimonials", response_model=List[TestimonialModel])
async def get_admin_testimonials(username: str = Depends(verify_token)):
    testimonials = await db.testimonials.find({}, {"_id": 0}).to_list(1000)
    for testimonial in testimonials:
        if isinstance(testimonial.get('created_at'), str):
            testimonial['created_at'] = datetime.fromisoformat(testimonial['created_at'])
    return testimonials

@api_router.post("/admin/testimonials", response_model=TestimonialModel)
async def create_testimonial(testimonial: TestimonialModel, username: str = Depends(verify_token)):
    doc = testimonial.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.testimonials.insert_one(doc)
    return testimonial

@api_router.put("/admin/testimonials/{testimonial_id}", response_model=TestimonialModel)
async def update_testimonial(testimonial_id: str, testimonial: TestimonialModel, username: str = Depends(verify_token)):
    doc = testimonial.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.testimonials.update_one({"id": testimonial_id}, {"$set": doc})
    return testimonial

@api_router.delete("/admin/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str, username: str = Depends(verify_token)):
    result = await db.testimonials.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted successfully"}

# Admin Gallery Management
@api_router.get("/admin/gallery", response_model=List[GalleryModel])
async def get_admin_gallery(username: str = Depends(verify_token)):
    gallery_items = await db.gallery.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for item in gallery_items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return gallery_items

@api_router.post("/admin/gallery", response_model=GalleryModel)
async def create_gallery_item(gallery_item: GalleryModel, username: str = Depends(verify_token)):
    doc = gallery_item.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.gallery.insert_one(doc)
    return gallery_item

@api_router.put("/admin/gallery/{item_id}", response_model=GalleryModel)
async def update_gallery_item(item_id: str, gallery_item: GalleryModel, username: str = Depends(verify_token)):
    doc = gallery_item.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.gallery.update_one({"id": item_id}, {"$set": doc})
    return gallery_item

@api_router.delete("/admin/gallery/{item_id}")
async def delete_gallery_item(item_id: str, username: str = Depends(verify_token)):
    result = await db.gallery.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return {"message": "Gallery item deleted successfully"}

# Admin Coaches Management
@api_router.get("/admin/coaches", response_model=List[CoachModel])
async def get_admin_coaches(username: str = Depends(verify_token)):
    coaches = await db.coaches.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for coach in coaches:
        if isinstance(coach.get('created_at'), str):
            coach['created_at'] = datetime.fromisoformat(coach['created_at'])
    return coaches

@api_router.post("/admin/coaches", response_model=CoachModel)
async def create_coach(coach: CoachModel, username: str = Depends(verify_token)):
    doc = coach.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.coaches.insert_one(doc)
    return coach

@api_router.put("/admin/coaches/{coach_id}", response_model=CoachModel)
async def update_coach(coach_id: str, coach: CoachModel, username: str = Depends(verify_token)):
    doc = coach.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.coaches.update_one({"id": coach_id}, {"$set": doc})
    return coach

@api_router.delete("/admin/coaches/{coach_id}")
async def delete_coach(coach_id: str, username: str = Depends(verify_token)):
    result = await db.coaches.delete_one({"id": coach_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coach not found")
    return {"message": "Coach deleted successfully"}

# Admin Success Stories Management
@api_router.get("/admin/success-stories", response_model=List[SuccessStoryModel])
async def get_admin_success_stories(username: str = Depends(verify_token)):
    stories = await db.success_stories.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for story in stories:
        if isinstance(story.get('created_at'), str):
            story['created_at'] = datetime.fromisoformat(story['created_at'])
    return stories

@api_router.post("/admin/success-stories", response_model=SuccessStoryModel)
async def create_success_story(story: SuccessStoryModel, username: str = Depends(verify_token)):
    doc = story.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.success_stories.insert_one(doc)
    return story

@api_router.put("/admin/success-stories/{story_id}", response_model=SuccessStoryModel)
async def update_success_story(story_id: str, story: SuccessStoryModel, username: str = Depends(verify_token)):
    doc = story.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.success_stories.update_one({"id": story_id}, {"$set": doc})
    return story

@api_router.delete("/admin/success-stories/{story_id}")
async def delete_success_story(story_id: str, username: str = Depends(verify_token)):
    result = await db.success_stories.delete_one({"id": story_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Success story not found")
    return {"message": "Success story deleted successfully"}

# Admin Endorsements Management
@api_router.get("/admin/endorsements", response_model=List[EndorsementModel])
async def get_admin_endorsements(username: str = Depends(verify_token)):
    endorsements = await db.endorsements.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for endorsement in endorsements:
        if isinstance(endorsement.get('created_at'), str):
            endorsement['created_at'] = datetime.fromisoformat(endorsement['created_at'])
    return endorsements

@api_router.post("/admin/endorsements", response_model=EndorsementModel)
async def create_endorsement(endorsement: EndorsementModel, username: str = Depends(verify_token)):
    doc = endorsement.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.endorsements.insert_one(doc)
    return endorsement

@api_router.put("/admin/endorsements/{endorsement_id}", response_model=EndorsementModel)
async def update_endorsement(endorsement_id: str, endorsement: EndorsementModel, username: str = Depends(verify_token)):
    doc = endorsement.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.endorsements.update_one({"id": endorsement_id}, {"$set": doc})
    return endorsement

@api_router.delete("/admin/endorsements/{endorsement_id}")
async def delete_endorsement(endorsement_id: str, username: str = Depends(verify_token)):
    result = await db.endorsements.delete_one({"id": endorsement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Endorsement not found")
    return {"message": "Endorsement deleted successfully"}

# Media Upload with Cloudinary
@api_router.post("/admin/upload")
async def upload_file(file: UploadFile = File(...), username: str = Depends(verify_token)):
    try:
        # Read file content
        contents = await file.read()
        
        # Determine resource type
        resource_type = "video" if file.content_type.startswith("video/") else "image"
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            contents,
            folder="tcprodojo",
            resource_type=resource_type,
            use_filename=True,
            unique_filename=True
        )
        
        return {
            "url": upload_result['secure_url'],
            "filename": upload_result['public_id'],
            "resource_type": resource_type,
            "public_id": upload_result['public_id']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@api_router.get("/admin/media")
async def list_media_files(username: str = Depends(verify_token)):
    try:
        # Get all resources from Cloudinary
        result = cloudinary.api.resources(
            type="upload",
            prefix="tcprodojo",
            max_results=500
        )
        
        files = []
        for resource in result.get('resources', []):
            files.append({
                "filename": resource['public_id'].split('/')[-1],
                "url": resource['secure_url'],
                "size": resource['bytes'],
                "created": resource['created_at'],
                "resource_type": resource['resource_type'],
                "public_id": resource['public_id']
            })
        
        return sorted(files, key=lambda x: x['created'], reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")

@api_router.delete("/admin/media/{public_id:path}")
async def delete_media_file(public_id: str, username: str = Depends(verify_token)):
    try:
        # Delete from Cloudinary
        result = cloudinary.uploader.destroy(public_id, invalidate=True)
        
        if result.get('result') == 'ok':
            return {"message": "File deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

# Public API endpoints (no authentication required)
@api_router.get("/success-stories", response_model=List[SuccessStoryModel])
async def get_public_success_stories():
    stories = await db.success_stories.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for story in stories:
        if isinstance(story.get('created_at'), str):
            story['created_at'] = datetime.fromisoformat(story['created_at'])
    return stories

@api_router.get("/endorsements", response_model=List[EndorsementModel])
async def get_public_endorsements():
    endorsements = await db.endorsements.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for endorsement in endorsements:
        if isinstance(endorsement.get('created_at'), str):
            endorsement['created_at'] = datetime.fromisoformat(endorsement['created_at'])
    return endorsements

@api_router.get("/coaches", response_model=List[CoachModel])
async def get_public_coaches():
    coaches = await db.coaches.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for coach in coaches:
        if isinstance(coach.get('created_at'), str):
            coach['created_at'] = datetime.fromisoformat(coach['created_at'])
    return coaches


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()