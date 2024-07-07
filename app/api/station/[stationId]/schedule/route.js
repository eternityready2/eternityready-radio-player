import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const formatDateParam = (input) => {
  return input < 10 ? `0${input}` : input;
};

// To handle a GET request to /api/station/[stationId]
export async function GET(request, { params }) {
  const { stationId } = params;

  // Parse the request URL to get the query parameters
  const url = new URL(request.url);
  const month = url.searchParams.get("month");
  const year = url.searchParams.get("year");

  if (!month || !year) {
    return NextResponse.json(
      { error: "Month and year parameters are required" },
      { status: 400 }
    );
  }

  try {
    // Execute SQL query to fetch the scheduled tracks from the database for the current month and get count of tracks for each day
    const tracks = await query(
      `SELECT DAY(dateScheduled) as day, COUNT(*) as count FROM scheduled_tracks WHERE stationId = ? AND MONTH(dateScheduled) = ? GROUP BY DAY(dateScheduled)`,
      [stationId, month]
    );

    const transformedData = tracks.map((track) => {
      return {
        title: `${track.count} - Track${track.count > 1 ? "s" : ""}`,
        date: `${year}-${formatDateParam(month)}-${formatDateParam(track.day)}`,
      };
    });

    // Return the fetched tracks
    return NextResponse.json(transformedData, { status: 200 });
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// To handle a POST request to /api/station/[stationId]/schedule
export async function POST(request, { params }) {
  const stationId = params.stationId;
  try {
    const formData = await request.formData();

    if (formData.get("_method") === "DELETE") {
      const trackId = formData.get("trackId");
      return await deleteTrack(trackId);
    }

    const sql = `INSERT INTO scheduled_tracks (stationId, trackId, artistId, trackName, artistName, trackViewUrl, artworkURL, dateScheduled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      stationId,
      formData.get("trackId"),
      formData.get("artistId"),
      formData.get("trackName"),
      formData.get("artistName"),
      formData.get("trackViewUrl"),
      formData.get("artworkURL"),
      formData.get("dateScheduled"),
    ];

    const result = await query(sql, values);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // get the inserted track
    const track = await query("SELECT * FROM scheduled_tracks WHERE id = ?", [
      result.insertId,
    ]);

    return NextResponse.json(track[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// To handle a DELETE request to /api/station/[stationId]/schedule
async function deleteTrack(trackId) {
  try {
    // Execute SQL query to delete the track from the database
    const result = await query("DELETE FROM scheduled_tracks WHERE id = ?", [
      trackId,
    ]);

    // Return the result of the delete operation
    return NextResponse.json(
      { message: "Track deleted successfully", result },
      { status: 200 }
    );
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}