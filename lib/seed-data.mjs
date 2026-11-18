// Mock people for the Discover feed. Photos are local generated avatars (see lib/avatar.mjs).
// `likesMe: true` means that person has ALREADY liked the logged-in user, so a right swipe
// on them produces a match. This flag lives only in seed data and the database; it is never
// exposed through any API.

export const ME = {
  id: "me",
  name: "You",
  age: 22,
  bio: "The person using Coy.",
  location: "Patna",
  interests: [],
};

export const PEOPLE = [
  ["Aarav", 22, "IIT Patna", "Chai first, code later. Will lose to you at carrom.", ["Coding", "Chai", "Cricket"], true],
  ["Ananya", 21, "Patna Women's College", "Sketchbook in my bag, playlist on repeat.", ["Illustration", "Indie music", "Poetry"], false],
  ["Rohan", 24, "Delhi", "Weekend cyclist. Always hunting for the best momos.", ["Cycling", "Street food", "Photography"], false],
  ["Ishita", 23, "Bengaluru", "Product designer who reads too many paperbacks.", ["Design", "Books", "Pottery"], true],
  ["Kabir", 25, "Mumbai", "Stand-up open mics and sunrise runs.", ["Comedy", "Running", "Films"], false],
  ["Meera", 20, "NIT Patna", "Third-year mech student, first-rank dal chawal fan.", ["Robotics", "Badminton", "Cooking"], false],
  ["Vihaan", 22, "Pune", "Guitar in the corner, trek plans in my notes app.", ["Guitar", "Trekking", "Coffee"], true],
  ["Diya", 21, "Kolkata", "Rabindrasangeet and rooftop sunsets.", ["Singing", "Travel", "Baking"], false],
  ["Arjun", 26, "Hyderabad", "Backend dev. Biryani opinions are non-negotiable.", ["Coding", "Biryani", "Chess"], false],
  ["Saanvi", 22, "Jaipur", "Block-print enthusiast and weekend thrifter.", ["Fashion", "Thrifting", "Art"], true],
  ["Reyansh", 23, "Lucknow", "Kebab tours, old Hindi songs, long walks.", ["Music", "Food", "Walking"], false],
  ["Navya", 20, "Delhi University", "Debate society. I will win this argument and the next.", ["Debate", "Politics", "Podcasts"], false],
  ["Aditya", 24, "Chennai", "Filter coffee and football on weekends.", ["Football", "Coffee", "Gaming"], true],
  ["Kiara", 22, "Ahmedabad", "Garba all night, startup ideas by morning.", ["Dance", "Startups", "Travel"], false],
  ["Dev", 27, "Gurugram", "Finance by day, amateur chef by night.", ["Cooking", "Finance", "Padel"], false],
  ["Myra", 21, "Patna", "Plant parent of fourteen. Send help and pots.", ["Plants", "Yoga", "Journaling"], true],
  ["Ayaan", 23, "IIM Calcutta", "MBA, pretending I understand wine.", ["Wine", "Tennis", "Business"], false],
  ["Tara", 22, "Goa", "Surf instructor, sunset chaser.", ["Surfing", "Beaches", "Photography"], false],
  ["Yash", 25, "Indore", "Poha is a personality. So is stand-up.", ["Comedy", "Food", "Bikes"], false],
  ["Zoya", 24, "Bhopal", "Spoken word and strong filter coffee.", ["Poetry", "Theatre", "Coffee"], true],
  ["Krish", 21, "BITS Pilani", "Hackathon addict. Sleep is optional.", ["Hackathons", "Gaming", "Anime"], false],
  ["Riya", 23, "Chandigarh", "Marathon training and matcha experiments.", ["Running", "Matcha", "Reading"], false],
  ["Neil", 22, "Shillong", "Metal on the speakers, mountains on the mind.", ["Guitar", "Trekking", "Metal"], false],
  ["Pari", 20, "Ranchi", "First-year, full of questions, empty of sleep.", ["Astronomy", "Painting", "Cats"], true],
  ["Samar", 26, "Bengaluru", "ML engineer who bakes sourdough.", ["Baking", "Machine learning", "Cycling"], false],
  ["Aisha", 22, "Hyderabad", "Calligraphy and long drives.", ["Calligraphy", "Road trips", "Music"], false],
  ["Rudra", 24, "Varanasi", "Boat rides at dawn and classical tabla.", ["Tabla", "Philosophy", "Photography"], false],
  ["Mahi", 21, "Patna Science College", "Physics nerd, cricket loyalist.", ["Physics", "Cricket", "Quizzing"], true],
  ["Veer", 25, "Delhi", "Ultimate frisbee captain, taco critic.", ["Frisbee", "Food", "Travel"], false],
  ["Anika", 23, "Mumbai", "Film school drop-in, short-film maker.", ["Filmmaking", "Writing", "Cafes"], false],
  ["Tejas", 22, "Nagpur", "Table tennis and tea-stall philosophy.", ["Table tennis", "Chai", "Podcasts"], false],
  ["Siya", 21, "Kochi", "Marine biology student, backwater wanderer.", ["Diving", "Biology", "Cooking"], true],
  ["Manav", 24, "Patna", "Civil services aspirant with a secret rap career.", ["Hip hop", "History", "Running"], false],
  ["Pranavi", 22, "Visakhapatnam", "Bharatanatyam on weekdays, beach on weekends.", ["Dance", "Beaches", "Films"], false],
  ["Kian", 23, "Mysuru", "Sketching old buildings, collecting stories.", ["Architecture", "Sketching", "Heritage walks"], false],
  ["Ira", 20, "Noida", "Content creator, but I swear I'm normal offline.", ["Reels", "Fashion", "Coffee"], true],
];
