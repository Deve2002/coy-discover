/**
 * The ONLY shape in which a person ever leaves the server.
 * Deliberately has no field about who liked whom: the privacy promise is enforced by the type.
 */
export interface PublicProfile {
  id: string;
  name: string;
  age: number;
  photoUrl: string;
  bio: string;
  location: string;
  interests: string[];
}

export type SwipeAction = "like" | "pass";

export interface SwipeResult {
  matched: boolean;
  /** Present only when matched is true. */
  match?: PublicProfile;
}

export interface MatchEntry extends PublicProfile {
  matchedAt: string;
}
