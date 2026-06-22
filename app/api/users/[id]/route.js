import { NextResponse }
from "next/server";

import {

getUser,
updateUser,
deleteUser

}

from "../../../../controllers/userController";

export async function GET(
  req,
  { params }
) {

  const { id } = await params;

  const { data, error } =
    await getUser(id);

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


export async function PUT(
  req,
  { params }
) {

  const { id } = await params;

  const body =
    await req.json();

  const { data, error } =
    await updateUser(
      id,
      body
    );

  if (error) {
    return NextResponse.json(
      {
        success:false,
        message:"Update User Failed"
      },
      { status: 400 }
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

  const { id } = await params;

  const { error } =
    await deleteUser(id);

  if (error) {
    return NextResponse.json(
      error,
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "Deleted"
  });

}