from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
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
import resend


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend configuration
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', 'druonyx@gmail.com')

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
    posterUrl: str = ""
    promoVideoUrl: str = ""
    ticketLink: str = ""
    displayOrder: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PastEventModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    youtubeUrl: str = ""
    description: str
    displayOrder: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TestimonialModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    text: str
    photoUrl: str = ""
    videoUrl: str = ""
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

class TipModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    videoUrl: str
    description: str = ""
    displayOrder: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClassScheduleModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    day: str
    time: str
    title: str
    instructor: str
    level: str
    spots: int
    type: str = "Wrestling"
    description: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CancelledClassModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    class_id: str  # Reference to the recurring class
    cancelled_date: str  # Format: "YYYY-MM-DD" (the specific date this class is cancelled)
    status: str = "cancelled"  # "cancelled" or "rescheduled"
    rescheduled_time: str = ""  # New time if rescheduled (e.g., "8:00 PM - 10:00 PM")
    reason: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NewsletterSubscriptionModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Student Model - for class change notifications
class StudentModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    classes: List[str] = []  # List of class IDs the student is enrolled in
    notes: str = ""
    active: bool = True
    notify_class_changes: bool = True  # Whether to notify about class schedule changes
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Media Model - for podcasts, videos, photos, articles
class MediaModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    mediaType: str  # "podcast", "video", "photo", "article"
    mediaUrl: str  # Cloudinary URL for image/video or external link
    thumbnailUrl: str = ""  # Optional thumbnail for videos/podcasts
    externalLink: str = ""  # External link for articles/podcasts
    displayOrder: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Site Settings Model - for logos and branding
class SiteSettingsModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    settingKey: str  # "homepage_logo", "circle_logo", "nav_tagline", etc.
    settingValue: str  # URL or text value
    settingType: str = "image"  # "image", "text", "link"
    description: str = ""
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


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

# Email notification helper
async def send_notification_email(subject: str, html_content: str):
    """Send email notification to the configured notification email"""
    if not resend.api_key or resend.api_key == 're_your_api_key_here':
        logging.warning("Resend API key not configured, skipping email notification")
        return None
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [NOTIFICATION_EMAIL],
            "subject": subject,
            "html": html_content
        }
        email = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Email notification sent: {email.get('id')}")
        return email
    except Exception as e:
        logging.error(f"Failed to send email notification: {str(e)}")
        return None

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

# Classes Endpoints (Public - fetches from database)
@api_router.get("/classes", response_model=List[ClassScheduleModel])
async def get_classes():
    classes = await db.classes.find({}, {"_id": 0}).to_list(1000)
    for class_item in classes:
        if isinstance(class_item.get('created_at'), str):
            class_item['created_at'] = datetime.fromisoformat(class_item['created_at'])
    return classes

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
        
        # Send email notification
        email_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                New Contact Form Submission
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">{contact.name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        <a href="mailto:{contact.email}" style="color: #3b82f6;">{contact.email}</a>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">{contact.phone or 'Not provided'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">{contact.subject}</td>
                </tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; color: #374151;">Message:</h3>
                <p style="margin: 0; white-space: pre-wrap; color: #4b5563;">{contact.message}</p>
            </div>
            <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
                This message was sent from the TC Pro Dojo website contact form.
            </p>
        </div>
        """
        await send_notification_email(
            f"TC Pro Dojo Contact: {contact.subject}",
            email_html
        )
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
    events = await db.events.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
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

# Admin Past Events Management
@api_router.get("/admin/past-events", response_model=List[PastEventModel])
async def get_admin_past_events(username: str = Depends(verify_token)):
    past_events = await db.past_events.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for event in past_events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
    return past_events

@api_router.post("/admin/past-events", response_model=PastEventModel)
async def create_past_event(past_event: PastEventModel, username: str = Depends(verify_token)):
    doc = past_event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.past_events.insert_one(doc)
    return past_event

@api_router.put("/admin/past-events/{event_id}", response_model=PastEventModel)
async def update_past_event(event_id: str, past_event: PastEventModel, username: str = Depends(verify_token)):
    doc = past_event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.past_events.update_one({"id": event_id}, {"$set": doc})
    return past_event

@api_router.delete("/admin/past-events/{event_id}")
async def delete_past_event(event_id: str, username: str = Depends(verify_token)):
    result = await db.past_events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Past event not found")
    return {"message": "Past event deleted successfully"}

# Admin Testimonial Management
@api_router.get("/admin/testimonials", response_model=List[TestimonialModel])
async def get_admin_testimonials(username: str = Depends(verify_token)):
    testimonials = await db.testimonials.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
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

# Admin Tips Management
@api_router.get("/admin/tips", response_model=List[TipModel])
async def get_admin_tips(username: str = Depends(verify_token)):
    tips = await db.tips.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for tip in tips:
        if isinstance(tip.get('created_at'), str):
            tip['created_at'] = datetime.fromisoformat(tip['created_at'])
    return tips

@api_router.post("/admin/tips", response_model=TipModel)
async def create_tip(tip: TipModel, username: str = Depends(verify_token)):
    tip_dict = tip.model_dump()
    if isinstance(tip_dict.get('created_at'), datetime):
        tip_dict['created_at'] = tip_dict['created_at'].isoformat()
    
    # Convert YouTube URL to embed format
    if tip_dict.get('videoUrl'):
        video_url = tip_dict['videoUrl']
        if 'youtube.com/watch?v=' in video_url:
            video_id = video_url.split('watch?v=')[1].split('&')[0]
            tip_dict['videoUrl'] = f'https://www.youtube.com/embed/{video_id}'
        elif 'youtu.be/' in video_url:
            video_id = video_url.split('youtu.be/')[1].split('?')[0]
            tip_dict['videoUrl'] = f'https://www.youtube.com/embed/{video_id}'
    
    await db.tips.insert_one(tip_dict)
    return tip

@api_router.put("/admin/tips/{tip_id}", response_model=TipModel)
async def update_tip(tip_id: str, tip: TipModel, username: str = Depends(verify_token)):
    tip_dict = tip.model_dump()
    if isinstance(tip_dict.get('created_at'), datetime):
        tip_dict['created_at'] = tip_dict['created_at'].isoformat()
    
    # Convert YouTube URL to embed format
    if tip_dict.get('videoUrl'):
        video_url = tip_dict['videoUrl']
        if 'youtube.com/watch?v=' in video_url:
            video_id = video_url.split('watch?v=')[1].split('&')[0]
            tip_dict['videoUrl'] = f'https://www.youtube.com/embed/{video_id}'
        elif 'youtu.be/' in video_url:
            video_id = video_url.split('youtu.be/')[1].split('?')[0]
            tip_dict['videoUrl'] = f'https://www.youtube.com/embed/{video_id}'
    
    result = await db.tips.update_one({"id": tip_id}, {"$set": tip_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tip not found")
    return tip

@api_router.delete("/admin/tips/{tip_id}")
async def delete_tip(tip_id: str, username: str = Depends(verify_token)):
    result = await db.tips.delete_one({"id": tip_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tip not found")
    return {"message": "Tip deleted successfully"}

# Admin Class Schedule Management
@api_router.get("/admin/classes", response_model=List[ClassScheduleModel])
async def get_admin_classes(username: str = Depends(verify_token)):
    classes = await db.classes.find({}, {"_id": 0}).to_list(1000)
    for class_item in classes:
        if isinstance(class_item.get('created_at'), str):
            class_item['created_at'] = datetime.fromisoformat(class_item['created_at'])
    return classes

@api_router.post("/admin/classes", response_model=ClassScheduleModel)
async def create_class(class_item: ClassScheduleModel, username: str = Depends(verify_token)):
    class_dict = class_item.model_dump()
    if isinstance(class_dict.get('created_at'), datetime):
        class_dict['created_at'] = class_dict['created_at'].isoformat()
    await db.classes.insert_one(class_dict)
    return class_item

@api_router.put("/admin/classes/{class_id}", response_model=ClassScheduleModel)
async def update_class(class_id: str, class_item: ClassScheduleModel, username: str = Depends(verify_token)):
    class_dict = class_item.model_dump()
    if isinstance(class_dict.get('created_at'), datetime):
        class_dict['created_at'] = class_dict['created_at'].isoformat()
    result = await db.classes.update_one({"id": class_id}, {"$set": class_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    return class_item

@api_router.delete("/admin/classes/{class_id}")
async def delete_class(class_id: str, username: str = Depends(verify_token)):
    result = await db.classes.delete_one({"id": class_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Class deleted successfully"}

# Cancelled Classes Management
@api_router.post("/admin/classes/cancel", response_model=CancelledClassModel)
async def cancel_class_instance(cancelled: CancelledClassModel, username: str = Depends(verify_token)):
    doc = cancelled.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.cancelled_classes.insert_one(doc)
    return cancelled

@api_router.get("/admin/classes/cancelled", response_model=List[CancelledClassModel])
async def get_cancelled_classes(username: str = Depends(verify_token)):
    cancelled = await db.cancelled_classes.find({}, {"_id": 0}).to_list(1000)
    for item in cancelled:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return cancelled

@api_router.delete("/admin/classes/cancel/{cancel_id}")
async def uncancel_class(cancel_id: str, username: str = Depends(verify_token)):
    result = await db.cancelled_classes.delete_one({"id": cancel_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cancellation not found")
    return {"message": "Class uncancelled successfully"}

@api_router.get("/classes/cancelled", response_model=List[CancelledClassModel])
async def get_public_cancelled_classes():
    cancelled = await db.cancelled_classes.find({}, {"_id": 0}).to_list(1000)
    for item in cancelled:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return cancelled

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

@api_router.get("/testimonials", response_model=List[TestimonialModel])
async def get_public_testimonials():
    testimonials = await db.testimonials.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for testimonial in testimonials:
        if isinstance(testimonial.get('created_at'), str):
            testimonial['created_at'] = datetime.fromisoformat(testimonial['created_at'])
    return testimonials

@api_router.get("/tips", response_model=List[TipModel])
async def get_public_tips():
    tips = await db.tips.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for tip in tips:
        if isinstance(tip.get('created_at'), str):
            tip['created_at'] = datetime.fromisoformat(tip['created_at'])
    return tips

@api_router.get("/classes", response_model=List[ClassScheduleModel])
async def get_public_classes():
    classes = await db.classes.find({}, {"_id": 0}).to_list(1000)
    for class_item in classes:
        if isinstance(class_item.get('created_at'), str):
            class_item['created_at'] = datetime.fromisoformat(class_item['created_at'])
    return classes

@api_router.get("/events", response_model=List[EventModel])
async def get_public_events():
    events = await db.events.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
    return events

@api_router.get("/past-events", response_model=List[PastEventModel])
async def get_public_past_events():
    past_events = await db.past_events.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for event in past_events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
    return past_events

# Newsletter Subscription Endpoints
@api_router.post("/newsletter/subscribe")
async def subscribe_newsletter(email: str):
    # Check if email already exists
    existing = await db.newsletter_subscriptions.find_one({"email": email})
    if existing:
        return {"message": "Email already subscribed", "success": True}
    
    subscription = {
        "id": str(uuid.uuid4()),
        "email": email,
        "subscribed_at": datetime.now(timezone.utc).isoformat()
    }
    await db.newsletter_subscriptions.insert_one(subscription)
    
    # Get total subscriber count
    total_count = await db.newsletter_subscriptions.count_documents({})
    
    # Send email notification
    email_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            New Newsletter Subscriber
        </h2>
        <div style="padding: 20px; background-color: #f3f4f6; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px;">
                <strong>Email:</strong> 
                <a href="mailto:{email}" style="color: #3b82f6;">{email}</a>
            </p>
        </div>
        <p style="color: #4b5563;">
            You now have <strong>{total_count}</strong> total newsletter subscribers.
        </p>
        <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
            This notification was sent from the TC Pro Dojo website.
        </p>
    </div>
    """
    await send_notification_email(
        f"TC Pro Dojo: New Newsletter Subscriber",
        email_html
    )
    
    return {"message": "Successfully subscribed", "success": True}

@api_router.get("/admin/newsletter-subscriptions", response_model=List[NewsletterSubscriptionModel])
async def get_newsletter_subscriptions(username: str = Depends(verify_token)):
    subscriptions = await db.newsletter_subscriptions.find({}, {"_id": 0}).sort("subscribed_at", -1).to_list(10000)
    for sub in subscriptions:
        if isinstance(sub.get('subscribed_at'), str):
            sub['subscribed_at'] = datetime.fromisoformat(sub['subscribed_at'])
    return subscriptions

@api_router.delete("/admin/newsletter-subscriptions/{subscription_id}")
async def delete_subscription(subscription_id: str, username: str = Depends(verify_token)):
    result = await db.newsletter_subscriptions.delete_one({"id": subscription_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"message": "Subscription deleted successfully"}


# ==================== STUDENTS MANAGEMENT ====================

@api_router.get("/admin/students", response_model=List[StudentModel])
async def get_students(username: str = Depends(verify_token)):
    students = await db.students.find({}, {"_id": 0}).sort("name", 1).to_list(10000)
    for student in students:
        if isinstance(student.get('created_at'), str):
            student['created_at'] = datetime.fromisoformat(student['created_at'])
    return students

@api_router.post("/admin/students", response_model=StudentModel)
async def create_student(student: StudentModel, username: str = Depends(verify_token)):
    # Check if email already exists
    existing = await db.students.find_one({"email": student.email})
    if existing:
        raise HTTPException(status_code=400, detail="A student with this email already exists")
    
    doc = student.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.students.insert_one(doc)
    return student

@api_router.put("/admin/students/{student_id}", response_model=StudentModel)
async def update_student(student_id: str, student: StudentModel, username: str = Depends(verify_token)):
    doc = student.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    result = await db.students.update_one({"id": student_id}, {"$set": doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@api_router.delete("/admin/students/{student_id}")
async def delete_student(student_id: str, username: str = Depends(verify_token)):
    result = await db.students.delete_one({"id": student_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}

@api_router.get("/admin/students/export")
async def export_students_csv(username: str = Depends(verify_token)):
    """Export all students with notify_class_changes=True as CSV for email notifications"""
    students = await db.students.find(
        {"active": True, "notify_class_changes": True}, 
        {"_id": 0}
    ).to_list(10000)
    
    # Return list of emails that can be used for class change notifications
    return {
        "count": len(students),
        "emails": [s['email'] for s in students],
        "students": [{"name": s['name'], "email": s['email']} for s in students]
    }


# ==================== CLOUDINARY UPLOAD SIGNATURE ====================

import time
import cloudinary.utils

@api_router.get("/admin/cloudinary/signature")
async def generate_cloudinary_signature(
    resource_type: str = "image",
    folder: str = "tcprodojo",
    username: str = Depends(verify_token)
):
    """Generate a signed upload signature for Cloudinary"""
    ALLOWED_FOLDERS = ("tcprodojo", "tcprodojo/media", "tcprodojo/logos", "uploads")
    
    # Validate folder
    if not any(folder.startswith(f) for f in ALLOWED_FOLDERS):
        raise HTTPException(status_code=400, detail="Invalid folder path")
    
    # Validate resource type
    if resource_type not in ["image", "video"]:
        raise HTTPException(status_code=400, detail="Invalid resource type")
    
    timestamp = int(time.time())
    params = {
        "timestamp": timestamp,
        "folder": folder
    }
    
    signature = cloudinary.utils.api_sign_request(
        params,
        os.environ.get("CLOUDINARY_API_SECRET")
    )
    
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": os.environ.get("CLOUDINARY_CLOUD_NAME"),
        "api_key": os.environ.get("CLOUDINARY_API_KEY"),
        "folder": folder,
        "resource_type": resource_type
    }


# ==================== MEDIA MANAGEMENT ====================

# Public Media Endpoints
@api_router.get("/media", response_model=List[MediaModel])
async def get_public_media():
    media = await db.media.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for item in media:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return media

# Admin Media Endpoints
@api_router.get("/admin/media", response_model=List[MediaModel])
async def get_admin_media(username: str = Depends(verify_token)):
    media = await db.media.find({}, {"_id": 0}).sort("displayOrder", 1).to_list(1000)
    for item in media:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return media

@api_router.post("/admin/media", response_model=MediaModel)
async def create_media(media: MediaModel, username: str = Depends(verify_token)):
    doc = media.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.media.insert_one(doc)
    return media

@api_router.put("/admin/media/{media_id}", response_model=MediaModel)
async def update_media(media_id: str, media: MediaModel, username: str = Depends(verify_token)):
    doc = media.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    result = await db.media.update_one({"id": media_id}, {"$set": doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return media

@api_router.delete("/admin/media/{media_id}")
async def delete_media(media_id: str, username: str = Depends(verify_token)):
    result = await db.media.delete_one({"id": media_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"message": "Media deleted successfully"}


# ==================== SITE SETTINGS MANAGEMENT ====================

# Public Site Settings Endpoints
@api_router.get("/site-settings")
async def get_public_site_settings():
    settings = await db.site_settings.find({}, {"_id": 0}).to_list(1000)
    # Return as a dictionary for easy access
    settings_dict = {}
    for setting in settings:
        settings_dict[setting['settingKey']] = setting['settingValue']
    return settings_dict

@api_router.get("/site-settings/{key}")
async def get_site_setting_by_key(key: str):
    setting = await db.site_settings.find_one({"settingKey": key}, {"_id": 0})
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting

# Admin Site Settings Endpoints
@api_router.get("/admin/site-settings", response_model=List[SiteSettingsModel])
async def get_admin_site_settings(username: str = Depends(verify_token)):
    settings = await db.site_settings.find({}, {"_id": 0}).to_list(1000)
    for setting in settings:
        if isinstance(setting.get('updated_at'), str):
            setting['updated_at'] = datetime.fromisoformat(setting['updated_at'])
    return settings

@api_router.post("/admin/site-settings", response_model=SiteSettingsModel)
async def create_site_setting(setting: SiteSettingsModel, username: str = Depends(verify_token)):
    # Check if setting with this key already exists
    existing = await db.site_settings.find_one({"settingKey": setting.settingKey})
    if existing:
        raise HTTPException(status_code=400, detail="Setting with this key already exists. Use PUT to update.")
    
    doc = setting.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.site_settings.insert_one(doc)
    return setting

@api_router.put("/admin/site-settings/{setting_id}", response_model=SiteSettingsModel)
async def update_site_setting(setting_id: str, setting: SiteSettingsModel, username: str = Depends(verify_token)):
    doc = setting.model_dump()
    doc['updated_at'] = datetime.now(timezone.utc).isoformat()
    result = await db.site_settings.update_one({"id": setting_id}, {"$set": doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting

@api_router.delete("/admin/site-settings/{setting_id}")
async def delete_site_setting(setting_id: str, username: str = Depends(verify_token)):
    result = await db.site_settings.delete_one({"id": setting_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Setting not found")
    return {"message": "Setting deleted successfully"}


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