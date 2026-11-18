import { ME, PEOPLE } from "./seed-data.mjs";

/**
 * Fill the database with mock profiles and the pre-existing likes.
 * Wipes existing swipes and profiles first, so it is safe to call repeatedly (used for demo reset too).
 */
export function seedDatabase(db) {
  const insertProfile = db.prepare(
    `INSERT INTO profiles (id, name, age, photo_url, bio, location, interests_json)
     VALUES (@id, @name, @age, @photo_url, @bio, @location, @interests_json)`
  );
  const insertLike = db.prepare(
    `INSERT INTO swipes (user_id, target_id, action) VALUES (?, ?, 'like')`
  );

  const run = db.transaction(() => {
    db.exec("DELETE FROM swipes; DELETE FROM profiles;");

    insertProfile.run({
      id: ME.id,
      name: ME.name,
      age: ME.age,
      photo_url: `/avatars/${ME.id}.svg`,
      bio: ME.bio,
      location: ME.location,
      interests_json: JSON.stringify(ME.interests),
    });

    PEOPLE.forEach(([name, age, location, bio, interests, likesMe], i) => {
      const id = `p${String(i + 1).padStart(2, "0")}`;
      insertProfile.run({
        id,
        name,
        age,
        photo_url: `/avatars/${id}.svg`,
        bio,
        location,
        interests_json: JSON.stringify(interests),
      });
      // This person has already liked the logged-in user, so a right swipe on them becomes a match.
      if (likesMe) insertLike.run(id, ME.id);
    });
  });
  run();

  return { profiles: PEOPLE.length, likesMe: PEOPLE.filter((p) => p[5]).length };
}
