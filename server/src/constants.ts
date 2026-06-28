

enum Room_Type
{
    STANDARD = "Standard",
    DELUXE = "Deluxe",
    EXECUTIVE = "Executive",
    SUITE = "Suite",
}

enum Booking_Status
{
    PENDING = "Pending",
    CONFIRMED = "Confirmed",
    CANCELLED = "Cancelled",
    REFUNDED = "Refunded",
    CHECKED_IN = "Checked In",
    CHECKED_OUT = "Checked Out"
}

enum Room_status
{
    AVAILABLE = "Available",
    OCCUPIED = "Occupied",
    CLEANING = "Cleaning",
    MAINTENANCE = "Maintenance"
}

enum Payment_Status
{
    PAID = "Paid",
    PENDING = "Pending",
    FAILED = "Failed"
}


enum UserRole
{
    CUSTOMER = "customer",
    HOTEL_OWNER = "hotelOwner",
    ADMIN = "admin",
}

enum LoginType
{
    GOOGLE = "google",
    EMAIL_PASSWORD = "email_Password"
}







export
{
    Room_Type,
    Booking_Status,
    Room_status,
    Payment_Status,
    UserRole,
    LoginType
}