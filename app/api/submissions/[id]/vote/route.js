import { NextResponse } from "next/server";
import { createSubmissionVote, getSubmissionVotes } from "../../../../../controllers/votesController";

export async function GET(req,{params}){
    const { id } = await params;

    const { data, error, status } = await getSubmissionVotes(id);

    if (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Search Votes Failed"
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

export async function POST(req,{params}){
    const { id } = await params;
    const userId = req.headers.get("x-user-id");

    try{
        const body = await req.json();
        const { data, error, status } = await createSubmissionVote(id, userId, body);

        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message || "Create Vote Failed"
                },
                { status: status || 400 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data
            },
            { status: 201 }
        );

    }

    catch(err){
        return NextResponse.json(
            {
                success: false,
                message: "Create Vote Failed"
            },
            { status: 500 }
        );

    }

}
