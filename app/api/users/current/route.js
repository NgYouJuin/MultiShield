import { NextResponse } from "next/server";
import { getUser } from "../../../../controllers/userController";

export async function GET(
  req,
  { params }
) {

    const userId =
    req.headers.get(
        "x-user-id"
    );

  const { data, error } =
    await getUser(userId);

  if (error) {
    return NextResponse.json(
      {
        success:false,
        message:"Get User By Id Failed"
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data
  });

}