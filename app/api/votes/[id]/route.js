import { NextResponse }
from "next/server";
import { deleteVote, getVote, updateSubmissionVote } from "../../../../controllers/votesController";


export async function GET(
  req,
  { params }
) {

  const { id } = await params;

  const { data, error } =
    await getVote(id);

  if (error) {
    return NextResponse.json(
      {
        success:false,
        message: "Get Vote By Id Failed"
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
        success:false,
        data
    }
  );

}


export async function PUT(
  req,
  { params }
) {
  const { id } = await params;
  const userId = req.headers.get("x-user-id");
  const body = await req.json();

  const { data, error, status } = await updateSubmissionVote(id, userId, body);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Update Vote Failed"
      },
      { status: status || 400 }
    );
  }
  
  return NextResponse.json(
    {
      success: true,
      data
    },
    { status: 200 }
  );

}


export async function DELETE(
  req,
  { params }
) {

  const { id } = await params;

  const { error } =
    await deleteVote(id);

  if (error) {
    return NextResponse.json(
      {
        success:false,
          message:
          "Delete Vote Failed"
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Deleted"
  });

}
