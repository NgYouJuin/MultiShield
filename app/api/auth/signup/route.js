import { NextResponse } from "next/server";
import { createUser } from "../../../../controllers/userController";
import { signup } from "../../../../controllers/authController";

export async function POST(req){
    try{
        const body =
        await req.json();

        const result =
        await signup(
            body
        );

        if(result.error){

            return NextResponse.json(

                {
                    success: false,
                    message:
                    result.error
                },

                {
                    status:401
                }

            );

        }

        return NextResponse.json(
            {
                success: true,
                data: result.data
            }
        );

    }

    catch(err){

        return NextResponse.json(

            {
                success: false,
                message:
                err.message
            },

            {
                status:500
            }

        );

    }

}