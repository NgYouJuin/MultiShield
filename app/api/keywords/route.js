import { NextResponse } from "next/server";
import { createKeyword } from "../../../controllers/keywordsController";


export async function POST(req){

    try{

        const body=
        await req.json();

        const {data,error}
        =await createKeyword(body);

        if(error){

            return NextResponse.json(
                {
                    success: false,
                    message: "Create keyword failed"
                },
                {status:400}
            );

        }

        return NextResponse.json(
            {
                success: true,
                data: data
            },
            {status:201}
        );

    }

    catch(err){

        return NextResponse.json(
            {
                success: false,
                message: "Create keyword failed"    
            },
            {status:500}
        );

    }

}