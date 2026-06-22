import { NextResponse }
from "next/server";
import { deleteKeyword, getKeyword, updateKeyword } from "../../../../controllers/keywordsController";


export async function GET(
  req,
  { params }
) {

  const { id } = await params;

  const { data, error } =
    await getKeyword(id);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Get keyword failed"
      },
      { status: 404 }
    );
  }

  return NextResponse.json(data);

}


export async function PUT(
  req,
  { params }
) {

  const { id } = await params;

  const body =
    await req.json();

  const { data, error } =
    await updateKeyword(
      id,
      body
    );

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Update keyword failed"
      },
      { status: 400 }
    );
  }

  return NextResponse.json(data);

}


export async function DELETE(
  req,
  { params }
) {

  const { id } = await params;

  const { error } =
    await deleteKeyword(id);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Delete keyword failed"
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Deleted"
  });

}