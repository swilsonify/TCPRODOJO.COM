#!/usr/bin/env python3
"""
Backend API Testing for TC Pro Dojo - Gallery Management & Testimonials
Tests all Gallery Management and Testimonials API endpoints with proper authentication
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://tcpro-dashboard.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test credentials
ADMIN_USERNAME = "elizabeth"
ADMIN_PASSWORD = "Kitch3n3r22"

class TestimonialsAPITester:
    def __init__(self):
        self.access_token: Optional[str] = None
        self.created_testimonial_id: Optional[str] = None
        self.test_results = []
        
    def log_test(self, test_name: str, status: str, details: str = ""):
        """Log test result"""
        result = {
            "test": test_name,
            "status": status,
            "details": details
        }
        self.test_results.append(result)
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authorization headers"""
        if not self.access_token:
            raise Exception("No access token available")
        return {"Authorization": f"Bearer {self.access_token}"}
    
    def test_admin_login(self) -> bool:
        """Test 1: Admin Login"""
        try:
            url = f"{API_BASE}/admin/login"
            payload = {
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            }
            
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    if data["token_type"] == "bearer":
                        self.access_token = data["access_token"]
                        self.log_test("Admin Login", "✅ PASSED", f"Token received successfully")
                        return True
                    else:
                        self.log_test("Admin Login", "❌ FAILED", f"Invalid token type: {data['token_type']}")
                        return False
                else:
                    self.log_test("Admin Login", "❌ FAILED", f"Missing token fields in response: {data}")
                    return False
            else:
                self.log_test("Admin Login", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Login", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_create_testimonial(self) -> bool:
        """Test 2: Create Testimonial (Admin Endpoint)"""
        try:
            url = f"{API_BASE}/admin/testimonials"
            payload = {
                "name": "Test Student",
                "role": "Professional Wrestler",
                "text": "This is a test testimonial to verify the API is working correctly.",
                "photoUrl": "https://i.imgur.com/test-photo.jpg",
                "videoUrl": "https://www.youtube.com/watch?v=test123"
            }
            
            response = requests.post(url, json=payload, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data:
                    self.created_testimonial_id = data["id"]
                    # Verify all required fields are present
                    required_fields = ["id", "name", "role", "text", "photoUrl", "videoUrl", "created_at"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_test("Create Testimonial", "✅ PASSED", f"Testimonial created with ID: {self.created_testimonial_id}")
                        return True
                    else:
                        self.log_test("Create Testimonial", "❌ FAILED", f"Missing fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Create Testimonial", "❌ FAILED", f"No ID in response: {data}")
                    return False
            else:
                self.log_test("Create Testimonial", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Testimonial", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_get_admin_testimonials(self) -> bool:
        """Test 3: Get Admin Testimonials"""
        try:
            url = f"{API_BASE}/admin/testimonials"
            
            response = requests.get(url, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Find our created testimonial
                    created_testimonial = None
                    for testimonial in data:
                        if testimonial.get("id") == self.created_testimonial_id:
                            created_testimonial = testimonial
                            break
                    
                    if created_testimonial:
                        # Verify all fields are present
                        required_fields = ["id", "name", "role", "text", "photoUrl", "videoUrl", "created_at"]
                        missing_fields = [field for field in required_fields if field not in created_testimonial]
                        
                        if not missing_fields:
                            self.log_test("Get Admin Testimonials", "✅ PASSED", f"Found created testimonial with all fields")
                            return True
                        else:
                            self.log_test("Get Admin Testimonials", "❌ FAILED", f"Created testimonial missing fields: {missing_fields}")
                            return False
                    else:
                        self.log_test("Get Admin Testimonials", "❌ FAILED", f"Created testimonial not found in list")
                        return False
                else:
                    self.log_test("Get Admin Testimonials", "❌ FAILED", f"Response is not an array: {type(data)}")
                    return False
            else:
                self.log_test("Get Admin Testimonials", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Admin Testimonials", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_get_public_testimonials(self) -> bool:
        """Test 4: Get Public Testimonials (No Auth)"""
        try:
            url = f"{API_BASE}/testimonials"
            
            # NO Authorization header - this is a public endpoint
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Find our created testimonial
                    created_testimonial = None
                    for testimonial in data:
                        if testimonial.get("id") == self.created_testimonial_id:
                            created_testimonial = testimonial
                            break
                    
                    if created_testimonial:
                        # Verify photoUrl and videoUrl fields are present
                        if "photoUrl" in created_testimonial and "videoUrl" in created_testimonial:
                            self.log_test("Get Public Testimonials", "✅ PASSED", f"Public endpoint works without auth, photoUrl and videoUrl present")
                            return True
                        else:
                            self.log_test("Get Public Testimonials", "❌ FAILED", f"photoUrl or videoUrl missing in public response")
                            return False
                    else:
                        self.log_test("Get Public Testimonials", "❌ FAILED", f"Created testimonial not found in public list")
                        return False
                else:
                    self.log_test("Get Public Testimonials", "❌ FAILED", f"Response is not an array: {type(data)}")
                    return False
            else:
                self.log_test("Get Public Testimonials", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Public Testimonials", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_update_testimonial(self) -> bool:
        """Test 5: Update Testimonial"""
        try:
            if not self.created_testimonial_id:
                self.log_test("Update Testimonial", "❌ FAILED", "No testimonial ID available for update")
                return False
                
            url = f"{API_BASE}/admin/testimonials/{self.created_testimonial_id}"
            payload = {
                "id": self.created_testimonial_id,
                "name": "Test Student",
                "role": "Professional Wrestler",
                "text": "This is an UPDATED test testimonial to verify the API is working correctly.",
                "photoUrl": "https://i.imgur.com/updated-photo.jpg",
                "videoUrl": "https://www.youtube.com/watch?v=updated123"
            }
            
            response = requests.put(url, json=payload, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if ("UPDATED" in data.get("text", "") and 
                    "updated-photo.jpg" in data.get("photoUrl", "")):
                    self.log_test("Update Testimonial", "✅ PASSED", f"Testimonial updated successfully")
                    return True
                else:
                    self.log_test("Update Testimonial", "❌ FAILED", f"Update not reflected in response: {data}")
                    return False
            else:
                self.log_test("Update Testimonial", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Update Testimonial", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_delete_testimonial(self) -> bool:
        """Test 6: Delete Testimonial"""
        try:
            if not self.created_testimonial_id:
                self.log_test("Delete Testimonial", "❌ FAILED", "No testimonial ID available for deletion")
                return False
                
            url = f"{API_BASE}/admin/testimonials/{self.created_testimonial_id}"
            
            response = requests.delete(url, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "success" in data["message"].lower():
                    self.log_test("Delete Testimonial", "✅ PASSED", f"Testimonial deleted successfully")
                    return True
                else:
                    self.log_test("Delete Testimonial", "❌ FAILED", f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Delete Testimonial", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Delete Testimonial", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_verify_deletion(self) -> bool:
        """Test 7: Verify Deletion"""
        try:
            url = f"{API_BASE}/testimonials"
            
            # Use public endpoint to verify deletion
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check that our testimonial is not in the list
                    deleted_testimonial = None
                    for testimonial in data:
                        if testimonial.get("id") == self.created_testimonial_id:
                            deleted_testimonial = testimonial
                            break
                    
                    if not deleted_testimonial:
                        self.log_test("Verify Deletion", "✅ PASSED", f"Testimonial successfully removed from public list")
                        return True
                    else:
                        self.log_test("Verify Deletion", "❌ FAILED", f"Deleted testimonial still found in public list: {deleted_testimonial}")
                        return False
                else:
                    self.log_test("Verify Deletion", "❌ FAILED", f"Response is not an array: {type(data)}")
                    return False
            else:
                self.log_test("Verify Deletion", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Verify Deletion", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all testimonials API tests in sequence"""
        print(f"Starting Testimonials API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_admin_login,
            self.test_create_testimonial,
            self.test_get_admin_testimonials,
            self.test_get_public_testimonials,
            self.test_update_testimonial,
            self.test_delete_testimonial,
            self.test_verify_deletion
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAILED {test.__name__}: Exception: {str(e)}")
                failed += 1
            print()  # Empty line between tests
        
        # Summary
        print("=" * 60)
        print(f"TESTIMONIALS API TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print("=" * 60)
        
        return passed, failed, self.test_results

class EventsAPITester:
    def __init__(self):
        self.access_token: Optional[str] = None
        self.created_event_ids: list = []
        self.test_results = []
        
    def log_test(self, test_name: str, status: str, details: str = ""):
        """Log test result"""
        result = {
            "test": test_name,
            "status": status,
            "details": details
        }
        self.test_results.append(result)
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authorization headers"""
        if not self.access_token:
            raise Exception("No access token available")
        return {"Authorization": f"Bearer {self.access_token}"}
    
    def test_admin_login(self) -> bool:
        """Test 1: Admin Login"""
        try:
            url = f"{API_BASE}/admin/login"
            payload = {
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            }
            
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    if data["token_type"] == "bearer":
                        self.access_token = data["access_token"]
                        self.log_test("Admin Login", "✅ PASSED", f"Token received successfully")
                        return True
                    else:
                        self.log_test("Admin Login", "❌ FAILED", f"Invalid token type: {data['token_type']}")
                        return False
                else:
                    self.log_test("Admin Login", "❌ FAILED", f"Missing token fields in response: {data}")
                    return False
            else:
                self.log_test("Admin Login", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Login", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_create_future_event(self) -> bool:
        """Test 2: Create Future Event"""
        try:
            url = f"{API_BASE}/admin/events"
            payload = {
                "title": "Future Championship Match",
                "date": "December 25, 2025",
                "time": "7:00 PM",
                "location": "TC Pro Dojo Arena",
                "description": "An exciting championship match featuring top wrestlers",
                "attendees": "200",
                "displayOrder": 1
            }
            
            response = requests.post(url, json=payload, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data:
                    self.created_event_ids.append(data["id"])
                    # Verify all required fields are present
                    required_fields = ["id", "title", "date", "time", "location", "description", "attendees", "displayOrder", "created_at"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_test("Create Future Event", "✅ PASSED", f"Future event created with ID: {data['id']}")
                        return True
                    else:
                        self.log_test("Create Future Event", "❌ FAILED", f"Missing fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Create Future Event", "❌ FAILED", f"No ID in response: {data}")
                    return False
            else:
                self.log_test("Create Future Event", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Future Event", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_create_past_event(self) -> bool:
        """Test 3: Create Past Event"""
        try:
            url = f"{API_BASE}/admin/events"
            payload = {
                "title": "New Year Wrestling Spectacular",
                "date": "January 1, 2024",
                "time": "8:00 PM",
                "location": "TC Pro Dojo Arena",
                "description": "A spectacular wrestling event to celebrate the new year",
                "attendees": "150",
                "displayOrder": 2
            }
            
            response = requests.post(url, json=payload, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data:
                    self.created_event_ids.append(data["id"])
                    # Verify all required fields are present
                    required_fields = ["id", "title", "date", "time", "location", "description", "attendees", "displayOrder", "created_at"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_test("Create Past Event", "✅ PASSED", f"Past event created with ID: {data['id']}")
                        return True
                    else:
                        self.log_test("Create Past Event", "❌ FAILED", f"Missing fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Create Past Event", "❌ FAILED", f"No ID in response: {data}")
                    return False
            else:
                self.log_test("Create Past Event", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Past Event", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_public_events_endpoint(self) -> bool:
        """Test 4: Public Events Endpoint (No Auth Required)"""
        try:
            url = f"{API_BASE}/events"
            
            # NO Authorization header - this is a public endpoint
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Verify our created events are in the list
                    found_events = []
                    for event in data:
                        if event.get("id") in self.created_event_ids:
                            found_events.append(event)
                    
                    if len(found_events) >= 2:
                        # Verify required fields are present
                        required_fields = ["id", "title", "date", "time", "location", "description", "attendees", "displayOrder", "created_at"]
                        all_fields_present = True
                        
                        for event in found_events:
                            missing_fields = [field for field in required_fields if field not in event]
                            if missing_fields:
                                all_fields_present = False
                                self.log_test("Public Events Endpoint", "❌ FAILED", f"Event {event.get('id')} missing fields: {missing_fields}")
                                return False
                        
                        if all_fields_present:
                            self.log_test("Public Events Endpoint", "✅ PASSED", f"Public endpoint works without auth, found {len(found_events)} created events with all required fields")
                            return True
                    else:
                        self.log_test("Public Events Endpoint", "❌ FAILED", f"Only found {len(found_events)} of {len(self.created_event_ids)} created events")
                        return False
                else:
                    self.log_test("Public Events Endpoint", "❌ FAILED", f"Response is not an array: {type(data)}")
                    return False
            else:
                self.log_test("Public Events Endpoint", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Public Events Endpoint", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_date_format_validation(self) -> bool:
        """Test 5: Date Format Validation"""
        try:
            url = f"{API_BASE}/events"
            
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Find our created events and test date parsing
                    test_dates = []
                    for event in data:
                        if event.get("id") in self.created_event_ids:
                            date_str = event.get("date", "")
                            try:
                                # Try to parse the date string with JavaScript Date() compatible formats
                                from datetime import datetime
                                
                                # Test common date formats that JavaScript can parse
                                parsed_date = None
                                formats_to_try = [
                                    "%B %d, %Y",  # "December 25, 2025"
                                    "%Y-%m-%d",   # "2025-12-25"
                                    "%m/%d/%Y",   # "12/25/2025"
                                ]
                                
                                for fmt in formats_to_try:
                                    try:
                                        parsed_date = datetime.strptime(date_str, fmt)
                                        break
                                    except ValueError:
                                        continue
                                
                                if parsed_date:
                                    test_dates.append({
                                        "event_id": event.get("id"),
                                        "date_str": date_str,
                                        "parsed": True,
                                        "title": event.get("title")
                                    })
                                else:
                                    test_dates.append({
                                        "event_id": event.get("id"),
                                        "date_str": date_str,
                                        "parsed": False,
                                        "title": event.get("title")
                                    })
                            except Exception as parse_error:
                                test_dates.append({
                                    "event_id": event.get("id"),
                                    "date_str": date_str,
                                    "parsed": False,
                                    "error": str(parse_error),
                                    "title": event.get("title")
                                })
                    
                    # Check if all dates are parseable
                    unparseable_dates = [d for d in test_dates if not d.get("parsed", False)]
                    
                    if not unparseable_dates:
                        self.log_test("Date Format Validation", "✅ PASSED", f"All {len(test_dates)} event dates are in valid JavaScript-parseable format")
                        return True
                    else:
                        details = f"Unparseable dates: {unparseable_dates}"
                        self.log_test("Date Format Validation", "❌ FAILED", details)
                        return False
                else:
                    self.log_test("Date Format Validation", "❌ FAILED", f"Response is not an array: {type(data)}")
                    return False
            else:
                self.log_test("Date Format Validation", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Date Format Validation", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_display_order_sorting(self) -> bool:
        """Test 6: Display Order Sorting"""
        try:
            url = f"{API_BASE}/events"
            
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 2:
                    # Check if events are sorted by displayOrder
                    display_orders = [event.get("displayOrder", 0) for event in data]
                    is_sorted = all(display_orders[i] <= display_orders[i+1] for i in range(len(display_orders)-1))
                    
                    if is_sorted:
                        self.log_test("Display Order Sorting", "✅ PASSED", f"Events are properly sorted by displayOrder: {display_orders}")
                        return True
                    else:
                        self.log_test("Display Order Sorting", "❌ FAILED", f"Events not sorted by displayOrder: {display_orders}")
                        return False
                else:
                    self.log_test("Display Order Sorting", "⚠️ WARNING", f"Not enough events to test sorting (found {len(data) if isinstance(data, list) else 0})")
                    return True  # Consider this a pass since we can't test with insufficient data
            else:
                self.log_test("Display Order Sorting", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Display Order Sorting", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_cleanup_events(self) -> bool:
        """Test 7: Cleanup Created Events"""
        try:
            success_count = 0
            for event_id in self.created_event_ids:
                url = f"{API_BASE}/admin/events/{event_id}"
                
                response = requests.delete(url, headers=self.get_auth_headers(), timeout=30)
                
                if response.status_code == 200:
                    success_count += 1
                else:
                    self.log_test("Cleanup Events", "⚠️ WARNING", f"Failed to delete event {event_id}: {response.status_code}")
            
            if success_count == len(self.created_event_ids):
                self.log_test("Cleanup Events", "✅ PASSED", f"Successfully deleted {success_count} test events")
                return True
            else:
                self.log_test("Cleanup Events", "⚠️ WARNING", f"Deleted {success_count}/{len(self.created_event_ids)} test events")
                return True  # Don't fail the test suite for cleanup issues
                
        except Exception as e:
            self.log_test("Cleanup Events", "⚠️ WARNING", f"Exception during cleanup: {str(e)}")
            return True  # Don't fail the test suite for cleanup issues
    
    def run_all_tests(self):
        """Run all events API tests in sequence"""
        print(f"Starting Events API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_admin_login,
            self.test_create_future_event,
            self.test_create_past_event,
            self.test_public_events_endpoint,
            self.test_date_format_validation,
            self.test_display_order_sorting,
            self.test_cleanup_events
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAILED {test.__name__}: Exception: {str(e)}")
                failed += 1
            print()  # Empty line between tests
        
        # Summary
        print("=" * 60)
        print(f"EVENTS API TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print("=" * 60)
        
        return passed, failed, self.test_results

class GalleryAPITester:
    def __init__(self):
        self.access_token: Optional[str] = None
        self.created_item_id: Optional[str] = None
        self.test_results = []
        
    def log_test(self, test_name: str, status: str, details: str = ""):
        """Log test result"""
        result = {
            "test": test_name,
            "status": status,
            "details": details
        }
        self.test_results.append(result)
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authorization headers"""
        if not self.access_token:
            raise Exception("No access token available")
        return {"Authorization": f"Bearer {self.access_token}"}
    
    def test_admin_login(self) -> bool:
        """Test 1: Admin Login"""
        try:
            url = f"{API_BASE}/admin/login"
            payload = {
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            }
            
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    if data["token_type"] == "bearer":
                        self.access_token = data["access_token"]
                        self.log_test("Admin Login", "✅ PASSED", f"Token received successfully")
                        return True
                    else:
                        self.log_test("Admin Login", "❌ FAILED", f"Invalid token type: {data['token_type']}")
                        return False
                else:
                    self.log_test("Admin Login", "❌ FAILED", f"Missing token fields in response: {data}")
                    return False
            else:
                self.log_test("Admin Login", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Login", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_create_gallery_item(self) -> bool:
        """Test 2: Create Gallery Item"""
        try:
            url = f"{API_BASE}/admin/gallery"
            payload = {
                "title": "Test Hero Image",
                "section": "home-hero",
                "type": "image",
                "url": "https://i.imgur.com/test.jpg",
                "description": "Test description",
                "displayOrder": 1
            }
            
            response = requests.post(url, json=payload, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data:
                    self.created_item_id = data["id"]
                    # Verify all fields are present
                    required_fields = ["id", "title", "section", "type", "url", "description", "displayOrder"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_test("Create Gallery Item", "✅ PASSED", f"Item created with ID: {self.created_item_id}")
                        return True
                    else:
                        self.log_test("Create Gallery Item", "❌ FAILED", f"Missing fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Create Gallery Item", "❌ FAILED", f"No ID in response: {data}")
                    return False
            else:
                self.log_test("Create Gallery Item", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Gallery Item", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_list_gallery_items(self) -> bool:
        """Test 3: List Gallery Items"""
        try:
            url = f"{API_BASE}/admin/gallery"
            
            response = requests.get(url, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Find our created item
                    created_item = None
                    for item in data:
                        if item.get("id") == self.created_item_id:
                            created_item = item
                            break
                    
                    if created_item:
                        # Verify all fields are present
                        required_fields = ["id", "title", "section", "type", "url", "description", "displayOrder"]
                        missing_fields = [field for field in required_fields if field not in created_item]
                        
                        if not missing_fields:
                            self.log_test("List Gallery Items", "✅ PASSED", f"Found created item with all fields")
                            return True
                        else:
                            self.log_test("List Gallery Items", "❌ FAILED", f"Created item missing fields: {missing_fields}")
                            return False
                    else:
                        self.log_test("List Gallery Items", "❌ FAILED", f"Created item not found in list")
                        return False
                else:
                    self.log_test("List Gallery Items", "❌ FAILED", f"Response is not an array: {type(data)}")
                    return False
            else:
                self.log_test("List Gallery Items", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("List Gallery Items", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_update_gallery_item(self) -> bool:
        """Test 4: Update Gallery Item"""
        try:
            if not self.created_item_id:
                self.log_test("Update Gallery Item", "❌ FAILED", "No item ID available for update")
                return False
                
            url = f"{API_BASE}/admin/gallery/{self.created_item_id}"
            payload = {
                "id": self.created_item_id,
                "title": "Updated Hero Image",
                "section": "home-hero",
                "type": "image",
                "url": "https://i.imgur.com/updated.jpg",
                "description": "Updated description",
                "displayOrder": 2
            }
            
            response = requests.put(url, json=payload, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("title") == "Updated Hero Image" and data.get("displayOrder") == 2:
                    self.log_test("Update Gallery Item", "✅ PASSED", f"Item updated successfully")
                    return True
                else:
                    self.log_test("Update Gallery Item", "❌ FAILED", f"Update not reflected in response: {data}")
                    return False
            else:
                self.log_test("Update Gallery Item", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Update Gallery Item", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_verify_update(self) -> bool:
        """Test 5: Verify Update"""
        try:
            url = f"{API_BASE}/admin/gallery"
            
            response = requests.get(url, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Find our updated item
                    updated_item = None
                    for item in data:
                        if item.get("id") == self.created_item_id:
                            updated_item = item
                            break
                    
                    if updated_item:
                        if (updated_item.get("title") == "Updated Hero Image" and 
                            updated_item.get("displayOrder") == 2):
                            self.log_test("Verify Update", "✅ PASSED", f"Update verified in list")
                            return True
                        else:
                            self.log_test("Verify Update", "❌ FAILED", f"Update not reflected: title={updated_item.get('title')}, displayOrder={updated_item.get('displayOrder')}")
                            return False
                    else:
                        self.log_test("Verify Update", "❌ FAILED", f"Updated item not found in list")
                        return False
                else:
                    self.log_test("Verify Update", "❌ FAILED", f"Response is not an array: {type(data)}")
                    return False
            else:
                self.log_test("Verify Update", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Verify Update", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_delete_gallery_item(self) -> bool:
        """Test 6: Delete Gallery Item"""
        try:
            if not self.created_item_id:
                self.log_test("Delete Gallery Item", "❌ FAILED", "No item ID available for deletion")
                return False
                
            url = f"{API_BASE}/admin/gallery/{self.created_item_id}"
            
            response = requests.delete(url, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "success" in data["message"].lower():
                    self.log_test("Delete Gallery Item", "✅ PASSED", f"Item deleted successfully")
                    return True
                else:
                    self.log_test("Delete Gallery Item", "❌ FAILED", f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Delete Gallery Item", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Delete Gallery Item", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def test_verify_deletion(self) -> bool:
        """Test 7: Verify Deletion"""
        try:
            url = f"{API_BASE}/admin/gallery"
            
            response = requests.get(url, headers=self.get_auth_headers(), timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check that our item is not in the list
                    deleted_item = None
                    for item in data:
                        if item.get("id") == self.created_item_id:
                            deleted_item = item
                            break
                    
                    if not deleted_item:
                        self.log_test("Verify Deletion", "✅ PASSED", f"Item successfully removed from list")
                        return True
                    else:
                        self.log_test("Verify Deletion", "❌ FAILED", f"Deleted item still found in list: {deleted_item}")
                        return False
                else:
                    self.log_test("Verify Deletion", "❌ FAILED", f"Response is not an array: {type(data)}")
                    return False
            else:
                self.log_test("Verify Deletion", "❌ FAILED", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Verify Deletion", "❌ FAILED", f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all gallery API tests in sequence"""
        print(f"Starting Gallery API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_admin_login,
            self.test_create_gallery_item,
            self.test_list_gallery_items,
            self.test_update_gallery_item,
            self.test_verify_update,
            self.test_delete_gallery_item,
            self.test_verify_deletion
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAILED {test.__name__}: Exception: {str(e)}")
                failed += 1
            print()  # Empty line between tests
        
        # Summary
        print("=" * 60)
        print(f"TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print("=" * 60)
        
        return passed, failed, self.test_results

def main():
    """Main test runner"""
    print("🚀 TC Pro Dojo Backend API Testing Suite")
    print("=" * 80)
    
    # Run Testimonials API Tests (Primary focus)
    print("\n🎯 TESTIMONIALS API TESTING")
    testimonials_tester = TestimonialsAPITester()
    t_passed, t_failed, t_results = testimonials_tester.run_all_tests()
    
    # Run Gallery API Tests (Secondary)
    print("\n📸 GALLERY API TESTING")
    gallery_tester = GalleryAPITester()
    g_passed, g_failed, g_results = gallery_tester.run_all_tests()
    
    # Overall Summary
    total_passed = t_passed + g_passed
    total_failed = t_failed + g_failed
    
    print("\n" + "=" * 80)
    print("🏆 OVERALL TEST SUMMARY")
    print(f"Testimonials: {t_passed}/{t_passed + t_failed} passed")
    print(f"Gallery: {g_passed}/{g_passed + g_failed} passed")
    print(f"Total Tests: {total_passed + total_failed}")
    print(f"Total Passed: {total_passed}")
    print(f"Total Failed: {total_failed}")
    print("=" * 80)
    
    # Exit with error code if any tests failed
    sys.exit(0 if total_failed == 0 else 1)

if __name__ == "__main__":
    main()