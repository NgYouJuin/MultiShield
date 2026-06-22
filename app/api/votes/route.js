import { NextResponse } from "next/server";
import { createVote, getVotes } from "../../../controllers/votesController";


export async function POST(req){

    try{

        const userId =
        req.headers.get(
            "x-user-id"
        );

        const body=
        await req.json();

        const {data,error}
        =await createVote({
            ...body,
            voter: userId
        });

        if(error){

            return NextResponse.json(
                {
                    success:false,
                    message: "Create Vote Failed"
                },
                {status:400}
            );

        }

        return NextResponse.json(
            {
                success: true,
                data
            },
            {status:201}
        );

    }

    catch(err){

        return NextResponse.json(
            {
                success: false,
                message:err.message
            },
            {status:500}
        );

    }

}


export async function GET(){

    const {data,error}
    =await getVotes();

    if(error){

        return NextResponse.json(
            {
                success:false,
                message: "Get Votes Failed"
            },
            {status:400}
        );

    }

    return NextResponse.json(
        {
            success:true,
            data
        }
    );

}