import { NextResponse }
from "next/server";
import { deleteSubmission, deleteSubmissionByCreator, getSubmission, updateSubmissionByCreator } from "../../../../controllers/submissionsController";



export async function GET(
  req,
  { params }
) {

  const { id } = await params;

  const { data, error } =
    await getSubmission(id);

  if (error) {
    return NextResponse.json(
      {
        success:false,
        message:"Get Submission By Id Failed"
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data
    }
  );

}


export async function PUT(
  req,
  { params }
) {

  const userId =
  req.headers.get(
      "x-user-id"
  );

  const { id } = await params;

  const body =
    await req.json();

  const { data, error } =
    await updateSubmissionByCreator(
      id,
      userId,
      body
    );

  if (error) {
    return NextResponse.json(
      {
        success:false,
        message:"Updating Submission Failed"
      },
      { status: 400 }
    );
  }

  
  if (!data || data.length === 0) {
    return NextResponse.json(
      { success: false, message: "Forbidden or submission not found" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    data
  });

}


export async function DELETE(
  req,
  { params }
) {

  const userId =
  req.headers.get(
      "x-user-id"
  );

  const { id } = await params;

  const { data, error } =
    await deleteSubmissionByCreator(id, userId);

  if (error) {
    return NextResponse.json(
      {
        success:false,
        message:"Delete Submission Failed"
      },
      { status: 400 }
    );
  }

    if (!data || data.length === 0) {
    return NextResponse.json(
      { success: false, message: "Forbidden or submission not found" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    data
  });

}