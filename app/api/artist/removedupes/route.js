import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST API route
export async function POST() {
  try {
    const artists = await query("SELECT * FROM artists");
    const artistIds = new Set();
    const artistIdsToRemove = new Set();
    const artistIdsToKeep = new Set();
    const artistsToRemove = [];
    const artistsToKeep = [];
    for (const artist of artists) {
      if (artistIds.has(artist.artistId)) {
        if (artist.refUrl) {
          artistIdsToRemove.add(artist.artistId);
          artistIdsToKeep.delete(artist.artistId);
        } else {
          artistIdsToRemove.delete(artist.artistId);
          artistIdsToKeep.add(artist.artistId);
        }
      } else {
        artistIds.add(artist.artistId);
        artistIdsToKeep.add(artist.artistId);
      }
    }
    for (const artist of artists) {
      if (artistIdsToRemove.has(artist.artistId)) {
        artistsToRemove.push(artist);
      } else if (artistIdsToKeep.has(artist.artistId)) {
        artistsToKeep.push(artist);
      }
    }
    const removePromises = artistsToRemove.map(async (artist) => {
      try {
        await query("DELETE FROM artists WHERE artistId = ?", [
          artist.artistId,
        ]);
        return `Removed duplicate artist: ${artist.artistId}`;
      } catch (error) {
        console.error("Error removing artist:", error);
        return `Failed to remove duplicate artist: ${artist.artistId}`;
      }
    });
    const removeResults = await Promise.all(removePromises);
    return NextResponse.json(removeResults, { status: 200 });
  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json("Failed to fetch artists", { status: 500 });
  }
}
