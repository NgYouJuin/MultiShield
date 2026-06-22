import { NextResponse } from "next/server";
import { createSubmission, getSubmissions } from "../../../controllers/submissionsController";


export async function POST(req){

    try{

        const userId =
        req.headers.get(
            "x-user-id"
        );

        const body=
        await req.json();

        const {data,error}
        =await createSubmission({
            ...body,
            creator: userId
        });

        if(error){
            console.log(error)
            return NextResponse.json(
                {
                    success: false,
                    message: "Creating Submission Failed"
                },
                {status:400}
            );

        }

        return NextResponse.json(
             {
                    success: true,
                    data
             },
            {status:200}
        );

    }

    catch(err){
        console.log(err)
        return NextResponse.json(
            {
                    success: false,
                    message: "Creating Submission Failed"
             },
            {status:500}
        );

    }

}


export async function GET(){

    const {data,error}
    =await getSubmissions();

    if(error){

        return NextResponse.json(
            {
                success: false,
                message: "Getting Submissions Failed"
            },
            {status:400}
        );

    }

    return NextResponse.json(
         {
            success: true,
            data
         },
         {status:200}
    );

}