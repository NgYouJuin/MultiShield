import { NextResponse } from "next/server";
import { endSubmissionVoting } from "../../../../../controllers/submissionsController";

export async function POST(
  req,
  { params }
) {
  const { id } = await params;
  const userId = req.headers.get("x-user-id");

  const { data, error, status } = await endSubmissionVoting(id, userId);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "End Submission Voting Failed"
      },
      { status: status || 400 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "End Submission Voting Succeeded",
      data
    },
    { status: 200 }
  );
}
