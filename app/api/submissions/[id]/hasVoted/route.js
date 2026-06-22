import { NextResponse } from "next/server";
import { getUserVotebySubmissionId } from "../../../../../controllers/votesController";

export async function GET(req,{params}){
    const userId =
    req.headers.get(
        "x-user-id"
    );

    const { id } = await params;

    const {data: voteData, error: searchVoteError} = await getUserVotebySubmissionId(id, userId)

    if(searchVoteError){

        return NextResponse.json(
            {
                success: false,
                message: "Search Vote Failed"
            },
            {status:400}
        );

    }

        return NextResponse.json(
            {
                success: true,
                data: voteData
            },
            {status:200}
        );
}